import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNewPlanDTO } from "src/schema/CreateNewPlanDTO";
import { NewRequestDTO, NewResponseDataDTO, NewResponseDTO } from 'src/schema/RequestDTO';
import { UpdatePlanDTO } from 'src/schema/UpdatePlanDTO';

@Injectable()
export class PlanService {
    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Function to create multi plans and store it in the database
     * @param planDetails Array of object of type CreateNewPlanDTO
     * @returns An Array of object CreateNewPlanDTO along with planId, createdAt and updatedAt dates
     */
    private async createMultiPlans(planDetails: CreateNewPlanDTO[]): Promise<Prisma.PlanGetPayload<{}>[]> {
        if (planDetails.length === 0) {
            return ([]);
        }
        return (await this.prismaService.plan.createManyAndReturn({ data: planDetails }))
    }

    /**
     * Function to update a single plan given its plan id
     * @param planDetails Object of type UpdatePlanDTO
     * @returns Updated object from the database containing planid, createdAt and updatedAt dates along found using planId
     */
    private async updateSinglePlan(planDetails: UpdatePlanDTO): Promise<Prisma.PlanGetPayload<{}>> {
        const { planId, ...otherProps } = planDetails;

        const isNotEmpty = Object.entries(otherProps).find(props => !!props[1]);
        if (!isNotEmpty) {
            return (await this.prismaService.plan.findUnique({ where: { planId } }));
        }
        return (await this.prismaService.plan.update({ where: { planId }, data: otherProps }));
    }

    /**
     * Function to update multi plan given plan ids and data that is to be updated
     * @param updatePlanDetails Array of objects of type UpdatedPlanDTO
     * @returns An object containing successfulPlan which stores all the information in the object in case a plan with planid is successfully updated, failedPlan in case plan containing planid cannot be updated
     */
    private async updateMultiPlan(updatePlanDetails: UpdatePlanDTO[]): Promise<{ successfulPlan: Prisma.PlanGetPayload<{}>[], failedPlans: (string[] | undefined) }> {
        if (updatePlanDetails.length === 0) {
            return ({ successfulPlan: [], failedPlans: undefined });
        }
        const updatedPlans = await Promise.allSettled(updatePlanDetails.map(plan => this.updateSinglePlan(plan)));
        const res = { successfulPlan: [] as Prisma.PlanGetPayload<{}>[], failedPlans: undefined as string[] | undefined };
        updatedPlans.forEach((planStatus, index) => {
            if (planStatus.status === "fulfilled") {
                res.successfulPlan.push(planStatus.value);
            } else if (res.failedPlans) {
                res.failedPlans.push(updatePlanDetails[index].planId);
            } else {
                res.failedPlans = [updatePlanDetails[index].planId];
            }
        })
        return (res);
    }

    /**
     * Function to take in plans from the database and check if any new plans are created, update existing plans and delete all the plans not present in the list
     * @param reqData Object of type NewRequestDTO containing all plans are creation, modification and deletion
     * @returns An object of type NewResponseDTO containing boolean parameter success which tells if the request was successful or not and data parameter containing plans are operation
     */
    async revisedRequest(reqData: NewRequestDTO): Promise<NewResponseDTO> {

        /**
         * Filter out plans to be created and updated using planId, plans to be created will not have planId
         */
        const plansToBeUpdated = reqData.plans.filter((plan): plan is UpdatePlanDTO => ("planId" in plan));
        const plansToBeCreated = reqData.plans.filter((plan): plan is CreateNewPlanDTO => !("planId" in plan));
        const planIdsToBeUpdated = plansToBeUpdated.map(plan => plan.planId);

        /**
         * Delete the plans which are not present in the reqData
         */
        const [createdPlanStatus, updatedPlanStatus] = await Promise.allSettled([this.createMultiPlans(plansToBeCreated), this.updateMultiPlan(plansToBeUpdated)]);
        const data: NewResponseDataDTO = {
            /** Property to store request data and send it in the response, in case plan creation fails */
            planFailedToBeCreated: createdPlanStatus.status === "rejected" ? plansToBeCreated : undefined,

            /** Property to store the IDs for which update failed and send it in the response, in case plan updation fails  */
            planFailedToBeUpdated: updatedPlanStatus.status === "rejected" ? plansToBeUpdated.map(plan => plan.planId) : updatedPlanStatus.value.failedPlans,
            plans: [...(createdPlanStatus.status === "fulfilled" ? createdPlanStatus.value : []), ...(updatedPlanStatus.status === "fulfilled" ? updatedPlanStatus.value.successfulPlan : [])]
        }

        /** Delete the plans only if the updation and completion happens successfully */
        const planIdsNotToBeDeleted = data.plans.map(plan => plan.planId);
        if (!data.planFailedToBeCreated?.length && !data.planFailedToBeUpdated?.length) {
            await this.prismaService.plan.deleteMany({ where: { planId: { notIn: planIdsNotToBeDeleted } } })
        } else {
            /** In case of failure send the data currently in the database back to the frontend for further operations */
            data.plans = await this.prismaService.plan.findMany({});
        }
        return ({ success: !data.planFailedToBeCreated?.length && !data.planFailedToBeUpdated?.length, data });
    }

    /**
     * Function to get all the plans currently in the database
     * @returns Object of type NewResponseDTO containing success parameter and data parameter
     */
    async getAllPlans(): Promise<NewResponseDTO> {
        const plans = await this.prismaService.plan.findMany();
        return ({ success: true, data: { plans } })

    }
}
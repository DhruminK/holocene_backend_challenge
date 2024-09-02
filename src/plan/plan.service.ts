import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNewPlanDTO } from "src/schema/CreateNewPlanDTO";
import { DeletePlanDTO } from 'src/schema/DeletePlanDTO';
import { RequestDTO, ResponseDTO } from 'src/schema/RequestDTO';
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
            return ({ successfulPlan: [], failedPlans: [] });
        }
        const updatedPlans = await Promise.allSettled(updatePlanDetails.map(plan => this.updateSinglePlan(plan)));
        const res = { successfulPlan: [], failedPlans: undefined };
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
     * Function to delete plans with given plan id
     * @param planIds An array of string containing plan ids
     */
    private async deleteMultiPlans(planIds: DeletePlanDTO["planIds"]): Promise<void> {
        if (planIds.length === 0) {
            return;
        }
        (await this.prismaService.plan.deleteMany({ where: { planId: { in: planIds } } }));
    }

    /**
     * Function to delete, update and create plans given the data recieved
     * @param reqData Object of type RequestDTO
     * @returns An object of type ResponseDTO
     */
    async serviceRequest(reqData: RequestDTO): Promise<ResponseDTO> {
        const [createNewPlan, updatePlan, deletePlan] = await Promise.allSettled([
            this.createMultiPlans(reqData.createNewPlans),
            this.updateMultiPlan(reqData.updatePlans),
            this.deleteMultiPlans(reqData.deletePlans.planIds)
        ]);

        const data: ResponseDTO["data"] = {
            planCreated: createNewPlan.status === "fulfilled" ? (createNewPlan.value) : [],
            planUpdated: updatePlan.status === "fulfilled" ? (updatePlan.value.successfulPlan) : [],
            planDeleted: deletePlan.status === "fulfilled" ? (reqData.deletePlans.planIds) : [],

            planFailedToBeCreated: createNewPlan.status === "rejected" ? (reqData.createNewPlans) : undefined,
            planFailedToBeDeleted: deletePlan.status === "rejected" ? (reqData.deletePlans.planIds) : undefined,
            planFailedToBeUpdated: updatePlan.status === "fulfilled" ? updatePlan.value.failedPlans : reqData.updatePlans.map(planDetails => planDetails.planId)
        }

        const isError = data.planFailedToBeCreated || data.planFailedToBeDeleted || data.planFailedToBeUpdated;
        return ({
            success: !isError, data
        })
    }
}
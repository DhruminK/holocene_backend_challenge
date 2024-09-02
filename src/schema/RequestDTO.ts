import { ArrayMinSize, IsObject, IsString, ValidateNested } from "class-validator";
import { CreateNewPlanDTO } from "./CreateNewPlanDTO";
import { DeletePlanDTO } from "./DeletePlanDTO";
import { UpdatePlanDTO } from "./UpdatePlanDTO";
import { Prisma } from "@prisma/client";
import { Type } from "class-transformer";

export class RequestDTO {
    @ValidateNested({ each: true })
    @ArrayMinSize(0)
    @Type(() => CreateNewPlanDTO)
    createNewPlans: CreateNewPlanDTO[];

    @ValidateNested()
    @Type(() => DeletePlanDTO)
    deletePlans: DeletePlanDTO;

    @ValidateNested({ each: true })
    @ArrayMinSize(0)
    @Type(() => UpdatePlanDTO)
    updatePlans: UpdatePlanDTO[];
}

export class ResponseDTO {
    success: boolean;
    data: {
        planCreated: Prisma.PlanGetPayload<{}>[];
        planUpdated: Prisma.PlanGetPayload<{}>[];
        planDeleted: string[];

        planFailedToBeUpdated?: string[];
        planFailedToBeCreated?: CreateNewPlanDTO[];
        planFailedToBeDeleted?: string[];
    }
}
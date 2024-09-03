import { ArrayMinSize, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateNewPlanDTO } from "./CreateNewPlanDTO";
import { DeletePlanDTO } from "./DeletePlanDTO";
import { UpdatePlanDTO } from "./UpdatePlanDTO";
import { Prisma } from "@prisma/client";
import { plainToClass, plainToInstance, Transform, Type } from "class-transformer";

export class NewRequestDTO {

    @ValidateNested({ each: true })
    @ArrayMinSize(0)
    // @Type(() => UpdatePlanDTO || CreateNewPlanDTO)
    @Transform(({ value }) => value?.map(val => !("planId" in val) ? plainToClass(CreateNewPlanDTO, val) : plainToClass(UpdatePlanDTO, val)))
    plans: Array<UpdatePlanDTO | CreateNewPlanDTO>;
}

export class NewResponseDataDTO {
    @ArrayMinSize(0)
    @ValidateNested({ each: true })
    @Type(() => UpdatePlanDTO)
    plans: UpdatePlanDTO[]

    @IsOptional()
    @ValidateNested({ each: true })
    @ArrayMinSize(0)
    planFailedToBeCreated?: CreateNewPlanDTO[];

    @IsOptional()
    @ValidateNested({ each: true })
    @ArrayMinSize(0)
    planFailedToBeUpdated?: string[];
}

export class NewResponseDTO {
    @IsBoolean()
    success: boolean;

    @ValidateNested()
    @Type(() => NewResponseDataDTO)
    data: NewResponseDataDTO

}
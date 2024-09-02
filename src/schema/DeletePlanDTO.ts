import { ArrayMinSize, IsArray, IsString } from "class-validator";

export class DeletePlanDTO {
    @IsString({ each: true })
    @IsArray()
    @ArrayMinSize(0)
    planIds: string[]
}
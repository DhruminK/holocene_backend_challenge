import { IsBoolean, IsHexColor, IsInt, IsNumber, IsString, Min, MinLength } from "class-validator"


export class CreateNewPlanDTO {

    @IsString()
    @IsHexColor()
    color: string;

    @IsString()
    @MinLength(1)
    name: string;

    @IsNumber()
    @IsInt()
    @Min(0)
    length: number;

    @IsNumber()
    @IsInt()
    @Min(0)
    width: number;

    @IsNumber()
    @IsInt()
    @Min(0)
    weight: number;

    @IsNumber()
    @IsInt()
    @Min(0)
    quantity: number;

    @IsBoolean()
    stackable: boolean;

    @IsBoolean()
    tiltable: boolean;
}
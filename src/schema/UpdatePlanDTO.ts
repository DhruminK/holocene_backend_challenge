import { IsBoolean, IsHexColor, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class UpdatePlanDTO {

    @IsString()
    @MinLength(1)
    planId: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsString()
    @IsHexColor()
    color?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    length?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    width?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    weight?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    quantity?: number;

    @IsOptional()
    @IsBoolean()
    stackable?: boolean;

    @IsOptional()
    @IsBoolean()
    tiltable?: boolean;
}
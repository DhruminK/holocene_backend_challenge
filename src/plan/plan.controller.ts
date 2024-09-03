import { Body, Controller, Get, Put } from '@nestjs/common';
import { NewRequestDTO, NewResponseDTO } from 'src/schema/RequestDTO';
import { PlanService } from './plan.service';

@Controller('plan')
export class PlanController {

    constructor(private readonly planService: PlanService) { }

    /**
     * API Endpoint to create, update and delete plans
     * @param data Object of type NewRequestDTO
     * @returns Object of type NewResponseDTO
     */
    @Put()
    async revisedModifyPlan(@Body() data: NewRequestDTO): Promise<NewResponseDTO> {
        return (this.planService.revisedRequest(data));
    }

    /**
     * API Endpoint to get all the plans currently stored in the database
     * @returns Object of type NewResponseDTO
     */
    @Get()
    async getAllPlans(): Promise<NewResponseDTO> {
        return (this.planService.getAllPlans())
    }
}

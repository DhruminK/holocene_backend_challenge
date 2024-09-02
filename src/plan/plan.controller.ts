import { Body, Controller, Put } from '@nestjs/common';
import { RequestDTO, ResponseDTO } from 'src/schema/RequestDTO';
import { PlanService } from './plan.service';

@Controller('plan')
export class PlanController {

    constructor(private readonly planService: PlanService) { }

    @Put()
    async modifyPlan(@Body() data: RequestDTO): Promise<ResponseDTO> {
        return (await this.planService.serviceRequest(data))
    }
}

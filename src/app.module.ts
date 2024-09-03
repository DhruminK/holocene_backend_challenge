import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [PrismaModule, PlanModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AppointmentModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}

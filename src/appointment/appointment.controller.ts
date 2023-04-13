import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointments.dto';

@ApiBearerAuth()
@ApiTags('Запись на прием')
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentServise: AppointmentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Создание записи' })
  @ApiResponse({
    status: 201,
    description: 'Запись создана',
  })
  @UsePipes(new ValidationPipe())
  createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentServise.createAppointment(createAppointmentDto);
  }
}

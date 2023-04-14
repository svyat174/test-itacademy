import { Injectable } from '@nestjs/common';
import { Appoinments } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointments.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appoinments> {
    console.log('createAppointmentDto', createAppointmentDto);
    return await this.prisma.appoinments.create({
      data: createAppointmentDto,
    });
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleLongNotify() {
    console.log('handleLongNotify');
    const now = new Date();
    const checkDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await this.prisma.appoinments.findMany({
      where: {
        date: {
          lte: checkDate,
        },
        longNotify: false,
      },
    });

    this.sendAppiontmentNotify(appointments);

    await this.prisma.appoinments.updateMany({
      where: {
        id: {
          in: appointments.map((a) => a.id),
        },
      },
      data: {
        longNotify: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleShortNotify() {
    console.log('handleShortNotify');
    const now = new Date();
    const checkDate = new Date(now.getTime() + 90 * 60 * 1000);

    const appointments = await this.prisma.appoinments.findMany({
      where: {
        date: {
          lte: checkDate,
        },
        shortNotify: false,
      },
    });

    this.sendAppiontmentNotify(appointments);

    await this.prisma.appoinments.updateMany({
      where: {
        id: {
          in: appointments.map((a) => a.id),
        },
      },
      data: {
        shortNotify: true,
      },
    });
  }

  private sendAppiontmentNotify(appoinments: Appoinments[]) {
    const now = new Date();
    const laterTime = new Date(now.getTime() + 90 * 60 * 1000);

    for (const appointment of appoinments) {
      if (appointment.date < laterTime) {
        console.log(`
        Уважаемый ${appointment.name}!
        Напоминаем, что у вас запись на прием к врачу ${
          appointment.doctorName
        } сегодня в ${appointment.date.getTime()}
        Адрес клиники: ${appointment.clinicAddress}
      `);
      } else {
        console.log(`
        Уважаемый ${appointment.name}!
        Напоминаем, что у вас запись на прием к врачу ${
          appointment.doctorName
        } завтра ${appointment.date.getDay()} в ${appointment.date.getTime()}
        Адрес клиники: ${appointment.clinicAddress}
      `);
      }
    }
  }
}

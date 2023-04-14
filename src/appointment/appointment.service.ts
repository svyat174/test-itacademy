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
    return await this.prisma.appoinments.create({
      data: createAppointmentDto,
    });
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleLongNotify() {
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

  private sendAppiontmentNotify(appointments: Appoinments[]) {
    const now = new Date();

    for (const appointment of appointments) {
      const timeDiff = appointment.date.getTime() - now.getTime();

      if (timeDiff <= 90 * 60 * 1000) {
        console.log(`
          Уважаемый ${appointment.name}!
          Напоминаем, что у вас запись на прием к врачу ${
            appointment.doctorName
          } через ${Math.round(timeDiff / (60 * 1000))} минут 
          (${appointment.date.getHours()}:${appointment.date.getMinutes()})
          Адрес клиники: ${appointment.clinicAddress}
        `);
      } else if (
        timeDiff <= 24 * 60 * 60 * 1000 &&
        timeDiff >= 90 * 60 * 1000 &&
        appointment.date.getDay() !== now.getDay()
      ) {
        console.log(`
          Уважаемый ${appointment.name}!
          Напоминаем, что у вас запись на прием к врачу ${
            appointment.doctorName
          } завтра ${appointment.date.getDay()}.${appointment.date.getMonth()} в ${appointment.date.getHours()}:${appointment.date.getMinutes()}
          Адрес клиники: ${appointment.clinicAddress}
        `);
      }
    }
  }
}

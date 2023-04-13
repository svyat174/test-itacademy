import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ default: 'Вася', description: 'Имя пользователя' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    default: 'a@a.ru',
    description: 'Адрес эл. почты пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    default: '+79008007000',
    description: 'Номер телефона пользователя',
  })
  @IsNotEmpty()
  @IsPhoneNumber('RU')
  readonly phone: string;

  @ApiProperty({
    default: '2023-04-13T00:00:00.000Z',
    description: 'Дата записи',
  })
  @IsNotEmpty()
  readonly date: Date;

  @ApiProperty({
    default: 'Сергей Иванович',
    description: 'Имя врача',
  })
  @IsNotEmpty()
  readonly doctorName: string;

  @ApiProperty({
    default: 'Адрес клиники',
    description: 'Адрес клиники',
  })
  @IsNotEmpty()
  readonly clinicAddress: string;
}

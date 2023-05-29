import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OTTimeSheetDto, TimeSheetDto } from './timeSheet.dto';
import {
  ServiceFailure,
  ServiceResponse,
  ServiceResponseStatus,
} from 'src/serviceResponse';
import { TimeSheet } from '@prisma/client';
import { TimeSheetFailure } from 'src/enumTypes/failure.enum';

@Injectable()
export class TimeSheetService {
  constructor(private prisma: PrismaService) {}

  public async checkIn(
    dto: TimeSheetDto,
  ): Promise<ServiceResponse<TimeSheet, ServiceFailure<TimeSheetFailure>>> {
    const timeSheet = await this.prisma.timeSheet.findFirst({
      where: {
        userId: dto.userId,
        checkInDate: dto.checkInDate,
        month: dto.month,
        year: dto.year,
      },
    });

    if (timeSheet) {
      if (
        timeSheet.hoursWorked === 8 ||
        timeSheet.hoursWorked + dto.hoursWorked > 8
      ) {
        return {
          status: ServiceResponseStatus.Failed,
          failure: {
            reason: TimeSheetFailure.TIME_SHEET_ALREADY_EXISTS,
          },
        };
      }

      const updatedTimeSheet = await this.prisma.timeSheet.update({
        where: {
          id: timeSheet.id,
        },
        data: {
          hoursWorked: timeSheet.hoursWorked + dto.hoursWorked,
        },
      });

      return {
        status: ServiceResponseStatus.Success,
        result: updatedTimeSheet,
      };
    }

    const newTimeSheet = await this.prisma.timeSheet.create({
      data: {
        userId: dto.userId,
        checkInDate: dto.checkInDate,
        hoursWorked: dto.hoursWorked,
        month: dto.month,
        year: dto.year,
      },
    });

    return {
      status: ServiceResponseStatus.Success,
      result: newTimeSheet,
    };
  }

  public async getMonthlyTimeSheet(
    userId: number,
    month: number,
    year: number,
  ): Promise<ServiceResponse<TimeSheet[], ServiceFailure<TimeSheetFailure>>> {
    const timeSheets = await this.prisma.timeSheet.findMany({
      where: {
        userId: userId,
        month: month,
        year: year,
      },
    });

    return {
      status: ServiceResponseStatus.Success,
      result: timeSheets,
    };
  }

  public async checkInOTHoursWorked(
    dto: OTTimeSheetDto,
  ): Promise<ServiceResponse<number, ServiceFailure<TimeSheetFailure>>> {
    const otTimeSheet = await this.prisma.timeSheet.findFirst({
      where: {
        userId: dto.userId,
        checkInDate: dto.checkInDate,
        month: dto.month,
        year: dto.year,
      },
    });

    if (otTimeSheet) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {
          reason: TimeSheetFailure.OT_TIME_SHEET_ALREADY_EXISTS,
        },
      };
    }

    const newOTTimeSheet = await this.prisma.timeSheet.create({
      data: {
        userId: dto.userId,
        checkInDate: dto.checkInDate,
        month: dto.month,
        year: dto.year,
        otHoursWorked: dto.otHoursWorked,
      },
    });

    return {
      status: ServiceResponseStatus.Success,
      result: newOTTimeSheet.otHoursWorked,
    };
  }

  public async getOTHoursWorkedInMonth(
    userId: number,
    month: number,
    year: number,
  ): Promise<ServiceResponse<number, ServiceFailure<TimeSheetFailure>>> {
    const timeSheets = await this.prisma.timeSheet.findMany({
      where: {
        userId: userId,
        month: month,
        year: year,
      },
    });

    let totalOTHoursWorked = 0;

    timeSheets.forEach((timeSheet) => {
      totalOTHoursWorked += timeSheet.otHoursWorked;
    });

    return {
      status: ServiceResponseStatus.Success,
      result: totalOTHoursWorked,
    };
  }

  public async totalTimeWorkedInMonth(
    userId: number,
    month: number,
    year: number,
  ): Promise<ServiceResponse<number, ServiceFailure<TimeSheetFailure>>> {
    const timeSheets = await this.prisma.timeSheet.findMany({
      where: {
        userId: userId,
        month: month,
        year: year,
      },
    });

    const { result: totalOTHoursWorked } = await this.getOTHoursWorkedInMonth(
      userId,
      month,
      year,
    );

    let totalHoursWorked = 0;

    timeSheets.forEach((timeSheet) => {
      totalHoursWorked += timeSheet.hoursWorked;
    });

    return {
      status: ServiceResponseStatus.Success,
      result: totalHoursWorked + totalOTHoursWorked,
    };
  }
}
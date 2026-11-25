import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { extractClientIp } from './client-ip';
import { PunchBody, TimeEntry } from './time-entry';
import { TimeClockService } from './time-clock.service';

@Controller()
export class TimeClockController {
  constructor(private readonly timeClockService: TimeClockService) {}

  @Post('punch')
  @HttpCode(HttpStatus.CREATED)
  punch(@Body() body: PunchBody | undefined, @Req() req: Request) {
    const result = this.timeClockService.punch(body, extractClientIp(req));
    if ('error' in result) {
      throw new HttpException(result, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Get('report/:email')
  report(@Param('email') email: string): TimeEntry[] {
    return this.timeClockService.report(email);
  }
}

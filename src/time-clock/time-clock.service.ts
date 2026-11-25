import { Injectable } from '@nestjs/common';
import { PunchBody, PunchFailure, PunchSuccess, TimeEntry } from './time-entry';

@Injectable()
export class TimeClockService {
  private readonly entries: TimeEntry[] = [];

  punch(
    body: PunchBody | null | undefined,
    clientIp: string | undefined,
  ): PunchSuccess | PunchFailure {
    const email = body?.email;
    const password = body?.password;
    const type = body?.type;

    if (!email || !password || !type) {
      return { error: 'Dados insuficientes.' };
    }

    const record: TimeEntry = {
      email,
      type,
      timestamp: new Date(),
      ip: String(clientIp),
    };
    this.entries.push(record);

    return {
      message: `Ponto de ${String(type)} batido com sucesso!`,
      data: record,
    };
  }

  report(email: string): TimeEntry[] {
    return this.entries.filter((entry) => entry.email === email);
  }
}

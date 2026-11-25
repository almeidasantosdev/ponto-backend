import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { TimeClockModule } from './time-clock/time-clock.module';

@Module({
  imports: [TimeClockModule],
  controllers: [HealthController],
})
export class AppModule {}

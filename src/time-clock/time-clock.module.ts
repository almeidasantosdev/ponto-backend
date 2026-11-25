import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { IpAllowlistMiddleware } from './ip-allowlist.middleware';
import { TimeClockController } from './time-clock.controller';
import { TimeClockService } from './time-clock.service';

@Module({
  controllers: [TimeClockController],
  providers: [TimeClockService, IpAllowlistMiddleware],
})
export class TimeClockModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(IpAllowlistMiddleware).forRoutes({
      path: 'punch',
      method: RequestMethod.POST,
    });
  }
}

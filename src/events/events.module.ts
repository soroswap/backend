import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { InfoModule } from 'src/info/info.module';
@Module({
  imports: [PrismaModule, InfoModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

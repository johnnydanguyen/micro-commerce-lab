import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueuesModule } from './queues/queues.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [QueuesModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

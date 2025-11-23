import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [AuthModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}

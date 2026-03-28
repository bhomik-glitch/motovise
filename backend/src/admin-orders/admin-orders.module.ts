import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [PrismaModule, RbacModule],
    controllers: [AdminOrdersController],
    providers: [AdminOrdersService],
})
export class AdminOrdersModule { }

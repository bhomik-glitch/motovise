
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [PrismaModule, RbacModule],
    controllers: [UsersController],
})
export class UsersModule { }

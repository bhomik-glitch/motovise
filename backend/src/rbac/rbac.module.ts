
import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [RbacService, PermissionsGuard],
    exports: [RbacService, PermissionsGuard], // Export Guard so it can be used globally or in other modules
})
export class RbacModule { }

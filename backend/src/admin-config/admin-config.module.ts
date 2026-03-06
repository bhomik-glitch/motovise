import { Module } from '@nestjs/common';
import { AdminConfigController } from './admin-config.controller';
import { AdminConfigService } from './admin-config.service';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [RbacModule],
    controllers: [AdminConfigController],
    providers: [AdminConfigService],
    exports: [AdminConfigService],
})
export class AdminConfigModule { }

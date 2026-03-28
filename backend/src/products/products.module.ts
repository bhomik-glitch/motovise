import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { UploadModule } from '../upload/upload.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [UploadModule, RbacModule],
    controllers: [ProductsController, AdminProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }

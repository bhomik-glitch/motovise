import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { STORAGE_PROVIDER } from './providers/storage.provider';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: STORAGE_PROVIDER,
            useClass: CloudinaryProvider,
        },
        UploadService,
    ],
    exports: [UploadService],
})
export class UploadModule { }

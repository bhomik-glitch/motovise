import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { StorageProvider } from './storage.provider';

@Injectable()
export class CloudinaryProvider implements StorageProvider {
    private readonly logger = new Logger(CloudinaryProvider.name);

    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async upload(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'ecommerce/products',
                    resource_type: 'image',
                },
                (error, result: UploadApiResponse) => {
                    if (error) {
                        this.logger.error(`Cloudinary upload failed: ${error.message}`);
                        return reject(error);
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );

            uploadStream.end(file.buffer);
        });
    }

    async delete(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            this.logger.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
            throw error;
        }
    }
}

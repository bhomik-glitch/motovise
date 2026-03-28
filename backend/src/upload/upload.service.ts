import { Injectable, Inject, Logger } from '@nestjs/common';
import { StorageProvider, STORAGE_PROVIDER } from './providers/storage.provider';

export interface UploadedImage {
    url: string;
    publicId: string;
}

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    constructor(
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider,
    ) { }

    /**
     * Upload multiple files to cloud storage.
     * Aborts immediately on first failure and rolls back already-uploaded files.
     * @returns Array of uploaded image metadata
     * @throws Error on upload failure (after cleanup)
     */
    async uploadFiles(files: Express.Multer.File[]): Promise<UploadedImage[]> {
        const uploaded: UploadedImage[] = [];

        for (const file of files) {
            try {
                const result = await this.storageProvider.upload(file);
                uploaded.push(result);
            } catch (error) {
                this.logger.error(
                    `Upload failed at file ${uploaded.length + 1}/${files.length}: ${error.message}`,
                );

                // Rollback all successfully uploaded files
                if (uploaded.length > 0) {
                    this.logger.warn(
                        `Rolling back ${uploaded.length} successfully uploaded file(s)...`,
                    );
                    await this.deleteFiles(uploaded.map((img) => img.publicId));
                }

                throw error;
            }
        }

        return uploaded;
    }

    /**
     * Delete multiple files from cloud storage using Promise.allSettled.
     * Never throws — logs failures instead.
     */
    async deleteFiles(publicIds: string[]): Promise<void> {
        if (publicIds.length === 0) return;

        const results = await Promise.allSettled(
            publicIds.map((id) => this.storageProvider.delete(id)),
        );

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.error(
                    `Failed to delete cloud file ${publicIds[index]}: ${result.reason?.message || result.reason}`,
                );
            }
        });

        const failed = results.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
            this.logger.warn(
                `Cloud cleanup: ${failed}/${publicIds.length} deletion(s) failed. Check logs above.`,
            );
        }
    }

    /**
     * Delete a single file from cloud storage.
     * Never throws — logs failures instead.
     */
    async deleteFile(publicId: string): Promise<void> {
        await this.deleteFiles([publicId]);
    }
}

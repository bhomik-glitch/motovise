/**
 * Abstracted Storage Provider Interface
 * All cloud storage implementations must conform to this contract.
 * Currently: Cloudinary. Future: S3, GCS, etc.
 */
export interface StorageProvider {
    /**
     * Upload a file to cloud storage.
     * @param file - Express.Multer.File with buffer
     * @returns Object containing the public URL and provider-specific publicId
     */
    upload(file: Express.Multer.File): Promise<{ url: string; publicId: string }>;

    /**
     * Delete a file from cloud storage by its publicId.
     * @param publicId - The provider-specific identifier for the stored file
     */
    delete(publicId: string): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

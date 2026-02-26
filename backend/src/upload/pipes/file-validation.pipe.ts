import {
    PipeTransform,
    Injectable,
    BadRequestException,
} from '@nestjs/common';

/**
 * Magic number signatures for allowed image types.
 * Used to validate file content beyond MIME type (which can be spoofed).
 */
const MAGIC_NUMBERS: { mime: string; bytes: number[]; offset?: number }[] = [
    // JPEG: FF D8 FF
    { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    // WebP: RIFF....WEBP (bytes at offset 0 = 52 49 46 46, offset 8 = 57 45 42 50)
    { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50]; // "WEBP" at offset 8

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 8;

// Common executable signatures to explicitly reject
const EXECUTABLE_SIGNATURES: number[][] = [
    [0x4d, 0x5a],             // PE/EXE (MZ header)
    [0x7f, 0x45, 0x4c, 0x46], // ELF binary
    [0x23, 0x21],             // Shebang (#!)
    [0x50, 0x4b, 0x03, 0x04], // ZIP/JAR
];

@Injectable()
export class FileValidationPipe implements PipeTransform {
    transform(files: Express.Multer.File[]): Express.Multer.File[] {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least 1 image is required');
        }

        if (files.length > MAX_FILES) {
            throw new BadRequestException(
                `Maximum ${MAX_FILES} images allowed. Received: ${files.length}`,
            );
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const label = `Image ${i + 1}`;

            // Check for empty buffer
            if (!file.buffer || file.buffer.length === 0) {
                throw new BadRequestException(`${label}: File is empty`);
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                throw new BadRequestException(
                    `${label}: File exceeds maximum size of 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
                );
            }

            // Check MIME type
            if (!ALLOWED_MIMES.includes(file.mimetype)) {
                throw new BadRequestException(
                    `${label}: Invalid file type '${file.mimetype}'. Allowed: ${ALLOWED_MIMES.join(', ')}`,
                );
            }

            // Check for executable signatures (reject immediately)
            if (this.isExecutable(file.buffer)) {
                throw new BadRequestException(
                    `${label}: File appears to be an executable or archive. Rejected.`,
                );
            }

            // Validate magic number (file signature)
            if (!this.hasValidSignature(file.buffer, file.mimetype)) {
                throw new BadRequestException(
                    `${label}: File signature does not match declared type '${file.mimetype}'. File may be corrupted or spoofed.`,
                );
            }
        }

        return files;
    }

    private isExecutable(buffer: Buffer): boolean {
        return EXECUTABLE_SIGNATURES.some((sig) =>
            sig.every((byte, index) => buffer.length > index && buffer[index] === byte),
        );
    }

    private hasValidSignature(buffer: Buffer, mimetype: string): boolean {
        const match = MAGIC_NUMBERS.find((mn) => mn.mime === mimetype);
        if (!match) return false;

        // Check initial bytes
        const offset = match.offset || 0;
        const valid = match.bytes.every(
            (byte, index) =>
                buffer.length > offset + index && buffer[offset + index] === byte,
        );

        if (!valid) return false;

        // Additional WebP check: bytes 8-11 must be "WEBP"
        if (mimetype === 'image/webp') {
            return WEBP_SIGNATURE.every(
                (byte, index) => buffer.length > 8 + index && buffer[8 + index] === byte,
            );
        }

        return true;
    }
}

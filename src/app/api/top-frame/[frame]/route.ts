import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET(
    _req: NextRequest,
    { params }: { params: { frame: string } },
) {
    const { frame } = params;

    if (!/^ezgif-frame-\d{3}\.jpg$/.test(frame)) {
        return new NextResponse('Not Found', { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'src', 'hero section', frame);

    if (!fs.existsSync(filePath)) {
        return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}

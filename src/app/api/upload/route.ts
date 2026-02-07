import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// 10 MB max file size
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types and their extensions
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * POST /api/upload
 * Upload a background image for a plan.
 *
 * Accepts: multipart/form-data with a "file" field.
 * Limits: 10MB max, JPG/PNG/WebP only.
 *
 * Returns: { url, width, height }
 *
 * TODO: Migrate to Vercel Blob or S3 for production.
 * Saving to public/uploads/ is only suitable for local development / MVP.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Send a "file" field in FormData.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Validate MIME type
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WebP.` },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const filename = `${randomUUID()}${extension}`;

    // TODO: Replace with Vercel Blob or S3 upload for production deployment.
    // The public/uploads/ approach does not persist on serverless platforms like Vercel.
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Attempt to read image dimensions from the raw buffer
    const dimensions = getImageDimensions(buffer, file.type);

    // Public URL (relative to the app root)
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      width: dimensions.width,
      height: dimensions.height,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * Extract image dimensions from raw buffer without external dependencies.
 * Supports PNG, JPEG, and WebP.
 */
function getImageDimensions(
  buffer: Buffer,
  mimeType: string
): { width: number; height: number } {
  try {
    if (mimeType === 'image/png') {
      // PNG: width at offset 16 (4 bytes BE), height at offset 20 (4 bytes BE)
      if (buffer.length >= 24) {
        return {
          width: buffer.readUInt32BE(16),
          height: buffer.readUInt32BE(20),
        };
      }
    }

    if (mimeType === 'image/jpeg') {
      // JPEG: scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) marker
      let offset = 2; // skip SOI marker
      while (offset < buffer.length - 1) {
        if (buffer[offset] !== 0xff) break;

        const marker = buffer[offset + 1];

        // SOF0, SOF1, SOF2 markers contain dimensions
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          if (offset + 9 < buffer.length) {
            return {
              height: buffer.readUInt16BE(offset + 5),
              width: buffer.readUInt16BE(offset + 7),
            };
          }
        }

        // Skip to next marker
        if (offset + 3 < buffer.length) {
          const segmentLength = buffer.readUInt16BE(offset + 2);
          offset += 2 + segmentLength;
        } else {
          break;
        }
      }
    }

    if (mimeType === 'image/webp') {
      // WebP: check for VP8 (lossy), VP8L (lossless), or VP8X (extended)
      if (buffer.length >= 30) {
        const fourCC = buffer.toString('ascii', 12, 16);

        if (fourCC === 'VP8 ' && buffer.length >= 30) {
          // Lossy VP8: dimensions at offset 26-29 (little-endian 16-bit)
          return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff,
          };
        }

        if (fourCC === 'VP8L' && buffer.length >= 25) {
          // Lossless VP8L: packed in 4 bytes starting at offset 21
          const bits = buffer.readUInt32LE(21);
          return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
          };
        }

        if (fourCC === 'VP8X' && buffer.length >= 30) {
          // Extended VP8X: width at 24 (3 bytes LE), height at 27 (3 bytes LE)
          return {
            width: (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1,
            height: (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1,
          };
        }
      }
    }
  } catch {
    // Fall through to defaults if parsing fails
  }

  return { width: 0, height: 0 };
}

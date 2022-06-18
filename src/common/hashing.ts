import crypto from 'crypto';

export function toSha256Hex(blob: string): string {
    const hashSha256 = crypto.createHash('sha256');
    return hashSha256.update(blob).digest('hex');
}
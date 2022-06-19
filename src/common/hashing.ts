import crypto from 'crypto';

/**
 * Use Sha256, Git's new hashing algo.
 * SEE: https://github.com/bk2204/git/commit/0ed8d8da374f648764758f13038ca93af87ab800
 * 
 * @param blob content to be hashed
 * @returns hex string
 */
export function toSha256Hex(blob: string): string {
    const hashSha256 = crypto.createHash('sha256');
    return hashSha256.update(blob).digest('hex');
}
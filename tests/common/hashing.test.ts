import { toSha256Hex } from "../../src/common/hashing";

describe('toSha256Hex()', () => {
    test('encrypts string correclty and consistently', () => {
        const expectedHash = 'f5903f51e341a783e69ffc2d9b335048716f5f040a782a2764cd4e728b0f74d9';
        expect(toSha256Hex('apples')).toBe(expectedHash);
    });

    test('encrypts empty string', () => {
        const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        expect(toSha256Hex('')).toBe(expectedHash);
    })
});
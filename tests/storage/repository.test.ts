import { MAX_REPOSITORY_LENGTH } from "../../src/common/config";
import { InvalidRepositoryName } from "../../src/common/errors";
import { PersistedRepositoryObject } from "../../src/storage/persisted";
import { persistedRepositoryObjectToKey, toKey, validateRepositoryName } from "../../src/storage/repository";

describe('storage - repository', () => {
    test('valid repository name', () => {
        // if these tests dont throw, then they are success full
        expect(validateRepositoryName('thisIsAValidName123')).toBe(undefined);
        expect(validateRepositoryName('valid.name_1-')).toBe(undefined);
    });

    test('invalid repository name - invalid chars', () => {
        expect(() => validateRepositoryName('!@#$'))
            .toThrowError(new InvalidRepositoryName(`Repository contains invalid characters.`));
        expect(() => validateRepositoryName('.'))
            .toThrowError(new InvalidRepositoryName(`Repository contains invalid characters.`));
    });

    test('invalid repository name - too long', () => {
        expect(() => validateRepositoryName('a'.repeat(MAX_REPOSITORY_LENGTH + 1)))
            .toThrowError(new InvalidRepositoryName(`Repository name length must be less than ${MAX_REPOSITORY_LENGTH}.`));
    });

    test('invalid repository name - empty string', () => {
        expect(() => validateRepositoryName(''))
            .toThrowError(new InvalidRepositoryName(`Repository name must be non-empty.`));
    });

    test('construct repository objectId key', () => {
        expect(toKey('repo', 'oid')).toBe('repo/oid');
    });

    test('construct PersistedRepositoryObject key', () => {
        const persistedRepositoryObject: PersistedRepositoryObject = {
            createdAt: new Date(),
            repository: 'a',
            oid: 'b',
            conentType: 'text/plain',
            blob: 'blob',
            size: 4,
        };
        expect(persistedRepositoryObjectToKey(persistedRepositoryObject)).toBe('a/b');
    });
});
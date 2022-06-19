import { MAX_REPOSITORY_LENGTH } from "../common/config";
import { DuplicateRepositoryObjectError, InvalidRepositoryName, NotFoundError } from "../common/errors";
import { logger } from "../common/logger";
import { ObjectId, PersistedRepositoryObject } from "./persisted";

export interface RepositoryClient {
    create(persistedRepositoryObject: PersistedRepositoryObject): Promise<PersistedRepositoryObject>;
    clear(): Promise<void>;
    delete(repository: string, oid: ObjectId): Promise<void>;
    get(repository: string, oid: ObjectId): Promise<PersistedRepositoryObject>;
}


/**
 * Mocks remote blob store like Google Cloud Storage or AWS S3.
 * Used for testing and local dev.
 */
export class InMemoryRepositoryClient implements RepositoryClient {
    store: Map<string, PersistedRepositoryObject>;

    constructor() {
        this.store = new Map();
    }

    async clear(): Promise<void> {
        this.store.clear();
    }

    async create(persistedRepositoryObject: PersistedRepositoryObject): Promise<PersistedRepositoryObject> {
        const key = persistedRepositoryObjectToKey(persistedRepositoryObject);

        if (this.store.has(key)) {
            logger.error(`Duplicate PersistedRepositoryObject found for repository:${persistedRepositoryObject.repository} oid:${persistedRepositoryObject.oid}.`);
            throw new DuplicateRepositoryObjectError();
        }

        this.store.set(key, persistedRepositoryObject);
        return persistedRepositoryObject;
    }

    async delete(repository: string, oid: ObjectId): Promise<void> {
        const key = toKey(repository, oid);
        const result = this.store.delete(key);
        if (!result) {
            // key was not found or already deleted
            throw new NotFoundError();
        }
    }

    async get(repository: string, oid: ObjectId): Promise<PersistedRepositoryObject> {
        const key = toKey(repository, oid);
        const persistedRepositoryObject = this.store.get(key);
        if (persistedRepositoryObject) {
            return persistedRepositoryObject;
        } else {
            logger.error(`PersistedRepositoryObject not found for repository:${repository} oid:${oid}.`);
            throw new NotFoundError();
        }
    }
}

/**
 * For this assessment, AwsS3RepositoryClient is just re-using InMemoryRepositoryClient.
 * In production setting, AwsS3RepositoryClient will contain a real implementation of Node.js AWS S3 client. 
 */
export class AwsS3RepositoryClient extends InMemoryRepositoryClient { }

// NOTE: we can swap out implementation here for dev or production env
export const repositoryClient: RepositoryClient = new AwsS3RepositoryClient();




// repository must start with at least one a-zA-Z0-9 char, then allow symbols
// https://stackoverflow.com/a/59082561/3538289
const REPOSITORY_NAME_REGEX = /^[a-zA-Z0-9]+[a-zA-Z0-9\-\._]*$/;

export function validateRepositoryName(repository: string): void {
    if (repository.length === 0) {
        throw new InvalidRepositoryName(`Repository name must be non-empty.`);
    }

    // https://github.com/gitbucket/gitbucket/commit/9bfe5115ccb3940380d2d8c6c96d7c007b14605b
    if (repository.length > MAX_REPOSITORY_LENGTH) {
        throw new InvalidRepositoryName(`Repository name length must be less than ${MAX_REPOSITORY_LENGTH}.`)
    }

    if (!REPOSITORY_NAME_REGEX.test(repository)) {
        throw new InvalidRepositoryName(`Repository contains invalid characters.`)
    }
}

export function persistedRepositoryObjectToKey(persistedRepositoryObject: PersistedRepositoryObject) {
    return toKey(persistedRepositoryObject.repository, persistedRepositoryObject.oid);
}
export function toKey(repository: string, oid: ObjectId) {
    return `${repository}/${oid}`;
}


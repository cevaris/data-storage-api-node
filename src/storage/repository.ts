import { DuplicateRepositoryObjectError, NotFoundError } from "../common/errors";
import { logger } from "../common/logger";
import { ObjectId, PersistedRepositoryObject } from "./persisted";

export interface RepositoryClient {
    create(persistedRepositoryObject: PersistedRepositoryObject): Promise<PersistedRepositoryObject>;
    clear(): Promise<void>;
    delete(repository: string, oid: ObjectId): Promise<void>;
    get(repository: string, oid: ObjectId): Promise<PersistedRepositoryObject>;
}

export function persistedRepositoryObjectToKey(persistedRepositoryObject: PersistedRepositoryObject) {
    return toKey(persistedRepositoryObject.repository, persistedRepositoryObject.oid);
}
export function toKey(repository: string, oid: ObjectId) {
    return `${repository}/${oid}`;
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

        // NOTE: because we are doing a read + write operation here, it opens us up to race conditions.
        //       this is not an issue with the in-memory implementation, rather when we end up productionalizing a S3 or GCS client.
        //       
        //       when using S3 or GCS, we should def use a database transaction to properly handle and duplicate entries to resolve 
        //       any issues overwriting producution blob store repository objects.
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
            // key was not found
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

export const repositoryClient: RepositoryClient = new InMemoryRepositoryClient();
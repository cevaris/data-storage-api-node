import { DuplicateRepositoryObjectError, NotFoundError } from "../common/errors";
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

        // NOTE: because we are doing a read + write operation here, it opens us up to race conditions.
        //       this is not an issue with the in-memory implementation, rather when we end up productionalizing a S3 or GCS client.
        //       
        //       when using S3 or GCS, we should def use a database transaction to properly handle and duplicate entries to resolve 
        //       any issues overwriting producution blob store repository objects.
        if (this.store.has(key)) {
            console.error(`Duplicate PersistedRepositoryObject found for repository:${persistedRepositoryObject.repository} oid:${persistedRepositoryObject.oid}.`);
            throw new DuplicateRepositoryObjectError();
        }

        this.store.set(key, persistedRepositoryObject);
        return persistedRepositoryObject;
    }

    async delete(repository: string, oid: ObjectId): Promise<void> {
        const key = toKey(repository, oid);
        this.store.delete(key);
    }

    async get(repository: string, oid: ObjectId): Promise<PersistedRepositoryObject> {
        const key = toKey(repository, oid);
        const persistedRepositoryObject = this.store.get(key);
        if (persistedRepositoryObject) {
            return persistedRepositoryObject;
        } else {
            console.error(`PersistedRepositoryObject not found for repository:${repository} oid:${oid}.`);
            throw new NotFoundError();
        }
    }
}

export function persistedRepositoryObjectToKey(persistedRepositoryObject: PersistedRepositoryObject) {
    return toKey(persistedRepositoryObject.repository, persistedRepositoryObject.oid);
}
export function toKey(repository: string, oid: ObjectId) {
    return `${repository}/${oid}`;
}

/**
 * Fake S3 storage implementation that we would normally use, outside an assesment project.
 * For now just reusing the InMemoryRepository for local dev.
 */
class AwsS3RepositoryClient extends InMemoryRepositoryClient { }

export const repositoryClient: RepositoryClient = new AwsS3RepositoryClient();
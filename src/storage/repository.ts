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
        throw Error('not implemented');
    }

    async create(persistedRepositoryObject: PersistedRepositoryObject): Promise<PersistedRepositoryObject> {
        throw Error('not implemented');
    }

    async delete(repository: string, oid: ObjectId): Promise<void> {
        throw Error('not implemented');
    }

    async get(repository: string, oid: ObjectId): Promise<PersistedRepositoryObject> {
        throw Error('not implemented');
    }
}

/**
 * Fake S3 storage implementation that we would normally use, outside an assesment project.
 * For now just reusing the InMemoryRepository for local dev.
 */
class AwsS3RepositoryClient extends InMemoryRepositoryClient { }

export const repositoryClient: RepositoryClient = new AwsS3RepositoryClient();
import { PersistedRepositoryObject } from "../storage/persisted";

export interface ApiRepositoryObject {
    oid: string;
    size: number;
}
export type ApiRepositoryObjectDownload = string

export function presentRepositoryObject(persistedRepositoryObject: PersistedRepositoryObject): ApiRepositoryObject {
    const value: ApiRepositoryObject = {
        oid: persistedRepositoryObject.oid,
        size: persistedRepositoryObject.size,
    }
    return value;
}

export function presentRepositoryObjectDownload(persistedRepositoryObject: PersistedRepositoryObject): ApiRepositoryObjectDownload {
    return persistedRepositoryObject.blob;
}
/**
 * Objects that are written to disk or cache.
 * WARNING: Any changes to these types should be backwards compatible. 
 *       Otherwise, that can break reading older persisted fields.
 */

// SHA-256 hex string
export type ObjectId = string;

export interface PersistedRepositoryObject {
    /**
     * Repository name
     */
    repository: string;

    /**
     * SHA-256 hex of blob
     */
    oid: ObjectId;

    /**
     * Object content
     */
    blob: string;

    /**
     * Size of blob
     */
    size: number;

    /**
     * Date of repository object creation
     */
    createdAt: Date;
}
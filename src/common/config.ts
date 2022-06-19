/**
 * Main entry point in the code for any process ENV variables.
 */

export const MAX_BLOB_LENGTH = optionalNumber('MAX_BLOB_LENGTH') || 10 * 1000 * 1000;
export const MAX_REPOSITORY_LENGTH = optionalNumber('MAX_REPOSITORY_LENGTH') || 100;
export const PORT = optional('PORT') || 3000;

function optionalNumber(name: string): number | undefined {
    const value = process.env[name];
    if (value == undefined) {
        return undefined;
    } else {
        // Note: this can still yeild a NaN (not a number), if the string contains
        //       an invalid number.
        parseInt(value);
    }
}
function optional(name: string): string | undefined {
    return process.env[name];
}
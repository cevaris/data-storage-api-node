interface Logger {
    info(...args: any[]): void;
    error(...args: any[]): void;
}

class ConsoleLogger implements Logger {
    info(...args: any[]): void {
        console.log(this.prefix('INFO'), `${args}`);
    }

    error(...args: any[]): void {
        console.error(this.prefix('ERROR'), `${args}`);
    }

    private prefix(level: string): string {
        return `${new Date().toISOString()} ${level}`;
    }
}

export const logger: Logger = new ConsoleLogger();
module.exports = logger;
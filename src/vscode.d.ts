// Type definitions for vscode module
// This is a minimal declaration to work with TypeScript 3.3.1

declare module 'vscode' {
    export interface ExtensionContext {
        subscriptions: { dispose(): any }[];
        globalState: any;
        workspaceState: any;
    }

    export namespace window {
        export function showWarningMessage(message: string): void;
        export function showErrorMessage(message: string): void;
        export function setStatusBarMessage(text: string): void;
    }

    export namespace workspace {
        export interface Configuration {
            get<T>(key: string, defaultValue?: T): T;
            update(key: string, value: any, target?: boolean): Thenable<void>;
        }
        export function getConfiguration(section?: string, scope?: any): Configuration;
    }

    export namespace commands {
        export interface Command {
            command: string;
            title: string;
        }
        export function registerCommand(command: string, callback: (...args: any[]) => any): { dispose(): any };
    }
}


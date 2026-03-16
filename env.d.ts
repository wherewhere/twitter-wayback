/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module "@microsoft/clarity/src/utils" {
    export function injectScript(projectId: string): void;
}
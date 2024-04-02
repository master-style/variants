/* eslint-disable quotes */
import { Config } from '@master/css'

const settings: Settings = {
    includedLanguages: [
        "html",
        "php",
        "javascript",
        "typescript",
        "javascriptreact",
        "typescriptreact",
        "vue",
        "svelte",
        "rust",
        "astro",
        "markdown",
        "mdx",
        "astro"
    ],
    classStrings: [
        ["class=", "\"", "\""],
        ["class=", "'", "'"],
        ["className=", "\"", "\""],
        ["className=", "'", "'"],
        ["styled(?:\\s+)?(?:\\.\\w+)", "`", "`"]
    ],
    classAssignments: [
        // react
        ["className=", "{", "}"],
        // vue
        [":class=", "\"", "\""],
        ["v-bind:class=", "\"", "\""],
        // svelte
        ["class=", "{", "}"],
        // angular
        ["[class]=", "\"", "\""],
        ["[className]=", "\"", "\""],
        ["[ngClass]=", "\"", "\""],
        // astro
        ["class:list=", "{", "}"],
        // invoke
        ["clsx", "(", ")"],
        ["styled", "(", ")"],
        ["styled(?:\\s+)?(?:\\.\\w+)", "(", ")"],
        ["cva", "(", ")"]
    ],
    exclude: ["**/.git/**", "**/node_modules/**", "**/.hg/**"],
    suggestSyntax: true,
    inspectSyntax: true,
    renderSyntaxColors: true,
    editSyntaxColors: true
}

export default settings

export declare type Settings = {
    includedLanguages?: string[]
    classStrings?: [string, string, string][]
    classAssignments?: [string, string, string][]
    exclude?: string[]
    config?: Config
    // features
    suggestSyntax?: boolean
    inspectSyntax?: boolean
    renderSyntaxColors?: boolean
    editSyntaxColors?: boolean
}
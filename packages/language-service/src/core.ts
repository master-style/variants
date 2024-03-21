import { Config, MasterCSS } from '@master/css'
import EventEmitter from 'node:events'
import exploreConfig from 'explore-config'
import type { Position, TextDocument } from 'vscode-languageserver-textdocument'
import settings, { type Settings } from './settings'
import { minimatch } from 'minimatch'
import { instancePattern } from './utils/regex'
import { fileURLToPath } from 'node:url'
import inspectSyntax from './features/inspect-syntax'
import getSyntaxCompletionItems from './features/hint-syntax-completions'
import renderSyntaxColors from './features/render-syntax-colors'
import editSyntaxColors from './features/edit-syntax-colors'
import { ColorPresentationParams } from 'vscode-languageserver'
import hintSyntaxCompletions from './features/hint-syntax-completions'

export default class MasterCSSLanguageService extends EventEmitter {
    css: MasterCSS
    settings: Settings
    config: Config

    constructor(
        public options?: {
            settings?: Settings
            config?: Config
            cwd?: string
        }
    ) {
        super()
        this.settings = Object.assign({}, settings, this.options?.settings)
        this.config = this.options?.config ? this.options.config : this.exploreConfig()
        this.css = new MasterCSS(this.config)
    }

    exploreConfig(configName = this.settings.config || 'master.css') {
        try {
            return exploreConfig(configName, {
                cwd: this.options?.cwd || process.cwd(),
                found: (basename) => process.env.NODE_ENV !== 'test' && console.log(`Loaded ${basename}`)
            })
        } catch (e) {
            console.log('Config loading failed')
            console.error(e)
            console.log('Using default config')
        }
    }

    onCompletion(textDocument: TextDocument, position: Position) {
        if (this.settings.hintSyntaxCompletions && this.isDocAllowed(textDocument)) {
            return hintSyntaxCompletions.call(this, textDocument, position)
        }
    }

    onHover(textDocument: TextDocument, position: Position) {
        if (this.settings.inspectSyntax && this.isDocAllowed(textDocument)) {
            return inspectSyntax.call(this, textDocument, position)
        }
    }

    onDocumentColor(textDocument: TextDocument) {
        if (this.settings.renderSyntaxColors && this.isDocAllowed(textDocument)) {
            return renderSyntaxColors.call(this, textDocument)
        }
    }

    onColorPresentation(textDocument: TextDocument, color: ColorPresentationParams['color'], range: ColorPresentationParams['range']) {
        if (this.settings.renderSyntaxColors && this.isDocAllowed(textDocument)) {
            return editSyntaxColors.call(this, textDocument, color, range)
        }
    }

    getPosition(text: string, positionIndex: number, startIndex: number, patterns?: string[]): {
        index: { start: number, end: number },
        instanceContent: string
    } | undefined {
        let result
        let instanceMatch: RegExpExecArray | null
        let classMatch: RegExpExecArray | null
        if (!patterns) patterns = this.settings.classMatch
        if (!patterns) return
        for (const classRegexString of patterns) {
            const classPattern = new RegExp(classRegexString, 'g')
            while ((classMatch = classPattern.exec(text)) !== null) {

                if ((classMatch.index <= (positionIndex - startIndex) && classMatch.index + classMatch[0].length >= (positionIndex - startIndex)) == true) {

                    const classContentStartIndex = classMatch.index + classMatch[1].length
                    instancePattern.lastIndex = 0
                    while ((instanceMatch = instancePattern.exec(classMatch[2])) !== null) {
                        const instanceStartIndex = classContentStartIndex + instanceMatch.index
                        const instanceEndIndex = classContentStartIndex + instanceMatch.index + instanceMatch[0].length

                        if (instanceStartIndex <= (positionIndex - startIndex) && instanceEndIndex >= (positionIndex - startIndex)) {
                            result = {
                                index: {
                                    start: instanceStartIndex,
                                    end: instanceEndIndex
                                },
                                instanceContent: instanceMatch[0]
                            }
                            return result
                        }
                    }
                }
                else if (classMatch.index > (positionIndex - startIndex)) {
                    break
                }
            }
        }
        return
    }

    isDocAllowed(doc: TextDocument): boolean {
        if (!this.settings.exclude) return true
        for (const exclude of this.settings.exclude) {
            if (minimatch(fileURLToPath(doc.uri), exclude)) {
                return false
            }
        }
        return true
    }
}
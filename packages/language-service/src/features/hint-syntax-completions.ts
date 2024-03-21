import {
    masterCssKeyValues,
    masterCssSelectors,
    masterCssElements,
    masterCssMedia,
    masterCssOtherKeys,
    masterCssType,
    masterCssCommonValues
} from '../constant'

import type { CompletionItem, CompletionItemKind } from 'vscode-languageserver'
import type { Position, TextDocument } from 'vscode-languageserver-textdocument'
import { MasterCSS } from '@master/css'
// @ts-expect-error
import { cssData } from 'vscode-css-languageservice/lib/umd/data/webCustomData'
// @ts-expect-error
import { CSSDataProvider } from 'vscode-css-languageservice/lib/umd/languageFacts/dataProvider'
import CSSLanguageService from '../core'

let cssKeys: Array<string | CompletionItem> = []
cssKeys = cssKeys.concat(masterCssOtherKeys)
masterCssKeyValues.forEach(x => {
    cssKeys = cssKeys.concat(x.key)
})

const masterCssKeys: Array<string | CompletionItem> = [...new Set(cssKeys)]

export default function hintSyntaxCompletions(this: CSSLanguageService, document: TextDocument, position: Position): CompletionItem[] | undefined {
    const language = document.uri.substring(document.uri.lastIndexOf('.') + 1)
    const checkResult = this.getPosition(document, position)
    const lineText: string = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character },
    }).trim()
    const lastInstance = getLastInstance(lineText, position, language)
    if (lastInstance.isInstance === true && checkResult) {
        return getCompletionItem(lastInstance.lastKey, lastInstance.triggerKey, lastInstance.isStart, lastInstance.language, this.css)
    } else if (lastInstance.isInstance === true && checkConfigColorsBlock(document, position) === true) {
        return getColorsItem(this.css)
    }
}

// temporary
export function checkConfigColorsBlock(document: TextDocument, position: Position) {
    const lineText: string = (document?.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character },
    }) ?? '').trim()

    if ((lineText.match(/'|"|`/g)?.length ?? 0) % 2 === 0) {
        return false
    }
    for (let i = position.line; i > 0; i--) {
        const text = document.getText({
            start: {
                line: i - 1,
                character: 0
            },
            end: {
                line: i,
                character: 0
            }
        })
        if (text.includes('}')) {
            return false
        } else if (text.includes('colors:')) {
            return true
        }
    }
    return false
}

export function getLastInstance(lineText: string, position: Position, language: string) {
    const classPattern = /(?:[^"{'\s])+(?=>\s|\b)/g
    let classMatch: RegExpExecArray | null
    let lastKey = ''

    let triggerKey = lineText.charAt(lineText.length - 1)
    let isStart = position.character == 1 || lineText.charAt(lineText.length - 2) === ' ' || lineText.charAt(lineText.length - 2) === '' || lineText.charAt(lineText.length - 2) === '"' || lineText.charAt(lineText.length - 2) === '\'' || lineText.charAt(lineText.length - 2) === '{'

    if (lineText.match(classPattern) === null) {
        return { isInstance: false, lastKey: '', triggerKey: '', isStart: false, language: language }
    }
    else {
        while ((classMatch = classPattern.exec(lineText)) !== null) {
            lastKey = classMatch[0]
        }
    }


    if (lineText.charAt(lineText.length - 2) === ':' && lineText.charAt(lineText.length - 1) === ':') {
        triggerKey = '::'
        isStart = false
    }

    return { isInstance: true, lastKey: lastKey, triggerKey: triggerKey, isStart: isStart, language: language }
}

export function getCompletionItem(instance: string, triggerKey: string, isStart: boolean, language: string, css: MasterCSS = new MasterCSS()) {
    const cssDataProvider = new CSSDataProvider(cssData)
    const cssProperties = cssDataProvider.provideProperties()
    const key = instance.split(':')[0].trim()
    const haveValue = instance.split(':').length
    const instanceLength = instance.split(':|@').length
    const last = instance.split(':|@')[instanceLength - 1]
    const mediaPattern = /[^\\s"]+@+([^\\s:"@]+)/g
    const elementsPattern = /[^\\s"]+::+([^\\s:"@]+)/g
    const isMedia = !(mediaPattern.exec(instance) === null && triggerKey !== '@')
    const isElements = !(elementsPattern.exec(instance) === null && triggerKey !== '::')
    let masterStyleCompletionItem: CompletionItem[] = []
    let isColorful = false

    const masterCssKeyCompletionItems: Array<CompletionItem> = []
    let masterCssValues: Array<string | CompletionItem> = []

    const masterCustomSelectors = Object.keys(css.config?.selectors ?? {})
        .map(x => x.endsWith('(') ? `${x})` : x)
        .filter(x => x.match(/:[^:]+/) && !masterCssSelectors.find(existedSelector => (typeof existedSelector === 'string' ? existedSelector : existedSelector.label) === `:${x}`))
        .map(x => {
            x = x.substring(1)
            if (x.endsWith(')')) {
                return { label: x, kind: 3 }
            }
            return x
        })

    const masterCustomElements = Object.keys(css.config?.selectors ?? {})
        .map(x => x.endsWith('(') ? `${x})` : x)
        .filter(x => x.match(/::[^:]+/) && !masterCssElements.find(existedElement => (typeof existedElement === 'string' ? existedElement : existedElement.label) === `::${x}`))
        .map(x => {
            x = x.substring(2)
            if (x.endsWith(')')) {
                return { label: x, kind: 3 }
            }
            return x
        })

    masterCssKeyValues.forEach(x => {
        const fullKey = x.key[0]
        const originalCssProperty = cssProperties.find((x: { name: string }) => x.name == fullKey)
        const originalCssValues = originalCssProperty?.values ?? []
        for (const masterKey of x.key) {
            if (!masterCssKeyCompletionItems.find(existedValue => existedValue.label === masterKey + ':')) {
                masterCssKeyCompletionItems.push({
                    label: masterKey + ':',
                    kind: 10,
                    documentation: originalCssProperty?.description ?? '',
                    command: {
                        title: 'triggerSuggest',
                        command: 'editor.action.triggerSuggest'
                    }
                })
            }
        }

        if (x.key.includes(key)) {
            // constant.ts custom values
            masterCssValues = masterCssValues.concat(
                x.values.filter(cssValue =>
                    !masterCssValues.find(existedValue => (typeof existedValue === 'string' ? existedValue : existedValue.label) === (typeof cssValue === 'string' ? cssValue : cssValue.label))
                )
            )

            masterCssValues = masterCssValues.concat(
                originalCssValues
                    .filter((cssValue: { description: any }, index: any) => cssValue.description || (!cssValue.description && originalCssValues.indexOf(cssValue) === index))
                    .map((cssValue: { name: string; description: any }) => ({
                        label: cssValue.name.replace(/,\s/g, ',').replace(/\s/g, '|').replace(/["']/g, ''),
                        kind: 10,
                        documentation: cssValue?.description ?? ''
                    } as CompletionItem))
                    .filter((cssValue: { label: any }) =>
                        !masterCssValues.find(existedValue => (typeof existedValue === 'string' ? existedValue : existedValue.label) === (typeof cssValue === 'string' ? cssValue : cssValue.label))
                    )
            )

            if (css.config?.variables?.[fullKey]) {
                const masterCustomVariables = Object.keys(css.config?.variables[fullKey])
                masterCssValues = masterCssValues.concat(
                    masterCustomVariables
                        .filter(customValue =>
                            !masterCssValues.find(existedValue => (typeof existedValue === 'string' ? existedValue : existedValue.label) === customValue)
                        )
                )
            }

            if (x.colored) {
                isColorful = true
                const needPushList = masterCssType.find(y => y.type === 'color')?.values.filter(z => !masterCssValues.find(a => (typeof a === 'string' ? a : a.label) === (typeof z === 'string' ? z : z.label)))
                if (needPushList) {
                    masterCssValues = masterCssValues.concat(needPushList as any)
                }
            }
        }
    })

    if ((isStart == true || !masterCssKeys.includes(key)) && triggerKey !== '@' && triggerKey !== ':') {  //ex " background"
        masterStyleCompletionItem = masterStyleCompletionItem.concat(masterCssKeyCompletionItems)
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(Object.keys(css.config?.semantics ?? {}), 10))

        if (language == 'tsx' || language == 'vue' || language == 'jsx') {
            return HaveDash(key, masterStyleCompletionItem)
        }
        return masterStyleCompletionItem
    }
    else if (isStart == true) {  //triggerKey==@|: //ex " :"
        return []
    }

    if (masterCssKeys.includes(key) && key !== null && isElements === true) { //show elements
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssElements as any, 10))
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCustomElements as any, 10))
        if ((language == 'tsx' || language == 'vue' || language == 'jsx') && triggerKey !== '@' && triggerKey !== ':') {
            return HaveDash(last, masterStyleCompletionItem)
        }
        return masterStyleCompletionItem
    }

    if (masterCssKeys.includes(key) && key !== null && isMedia === true) { //show media
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssMedia as any, 10))
        // todo: refactor theme
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(['light', 'dark'], 10))
        if ((language == 'tsx' || language == 'vue' || language == 'jsx') && triggerKey !== '@' && triggerKey !== ':') {
            return HaveDash('@' + last, masterStyleCompletionItem)
        }
        return masterStyleCompletionItem
    }

    if (Object.keys(css.config?.semantics ?? {}).includes(key) && !masterCssKeyValues.find(x => x.key.includes(key))) {
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssSelectors as any, 10))
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCustomSelectors as any, 10))
        if ((language == 'tsx' || language == 'vue' || language == 'jsx') && triggerKey !== '@' && triggerKey !== ':') {
            return HaveDash(last, masterStyleCompletionItem)
        }
        return masterStyleCompletionItem

    }
    else if (masterCssKeys.includes(key) && haveValue <= 2 && !(haveValue == 2 && triggerKey === ':')) {  //show value
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssValues, 10))
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssCommonValues as any, 13).map(x => { x.sortText = 'z' + x; return x }))

        if (isColorful) {
            masterStyleCompletionItem = masterStyleCompletionItem.concat(getColorsItem(css))
        }
        if ((language == 'tsx' || language == 'vue' || language == 'jsx') && triggerKey !== '@' && triggerKey !== ':') {
            return HaveDash(last, masterStyleCompletionItem)
        }
        return masterStyleCompletionItem
    }

    if (masterCssKeys.includes(key) && (haveValue == 2 && triggerKey === ':' || haveValue >= 3) || masterCssKeyValues.find(x => x.values.includes(key))) { //show select
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCssSelectors as any, 3))
        masterStyleCompletionItem = masterStyleCompletionItem.concat(getReturnItem(masterCustomSelectors as any, 10))
    }

    if ((language == 'tsx' || language == 'vue' || language == 'jsx') && triggerKey !== '@' && triggerKey !== ':') {
        return HaveDash(last, masterStyleCompletionItem)
    }
    return masterStyleCompletionItem
}


export function getReturnItem(items: Array<string | CompletionItem>, kind: CompletionItemKind, insertText = ''): CompletionItem[] {
    const masterStyleCompletionItem: CompletionItem[] = []

    items.forEach(x => {
        if (typeof x === 'string') {
            masterStyleCompletionItem.push({
                label: x + insertText,
                kind: kind,
                insertText: x + insertText,
                insertTextMode: 2,
                command: insertText === ':'
                    ? {
                        title: 'triggerSuggest',
                        command: 'editor.action.triggerSuggest'
                    }
                    : undefined
            })
        } else {
            masterStyleCompletionItem.push({
                insertText: x.label + insertText,
                insertTextMode: 2,
                command: insertText === ':'
                    ? {
                        title: 'triggerSuggest',
                        command: 'editor.action.triggerSuggest'
                    }
                    : undefined
                ,
                ...x
            })
        }
    })
    return masterStyleCompletionItem
}

export function getColorsItem(css: MasterCSS = new MasterCSS()): CompletionItem[] {
    const masterStyleCompletionItem: CompletionItem[] = []

    for (const eachVariableName in css.variables) {
        const eachVariable = css.variables[eachVariableName]
        if (eachVariable.type === 'color') {

            let colorValue
            let colorSpace
            if (eachVariable.modes) {
                colorValue = Object.values(eachVariable.modes)[0].value
                colorSpace = Object.values<any>(eachVariable.modes)[0].space
            } else {
                colorValue = eachVariable.value
                colorSpace = eachVariable.space
            }

            let colorResult
            switch (colorSpace) {
                case 'rgb':
                    colorResult = `rgb(${colorValue?.split(' ')?.slice(0, 3).join(',')})`
                    break
                case 'hsl':
                    colorResult = `hsl(${colorValue?.split(' ')?.slice(0, 3).join(',')})`
                    break
                case 'hex':
                    colorResult = `#${colorValue}`
                    break
            }

            masterStyleCompletionItem.push({
                label: eachVariableName,
                documentation: colorResult,
                kind: 16,
                sortText: eachVariableName
            })
        }
    }
    return masterStyleCompletionItem
}

function HaveDash(str: string, itemList: CompletionItem[]): CompletionItem[] {
    const completionItem: CompletionItem[] = []
    if (str.split('-').length - 1 <= 0) {
        return itemList
    }
    else {
        const start = str.split('-')[0] + '-'
        itemList.map(x => {
            if (x.label.includes(start)) {
                completionItem.push({
                    label: x.label,
                    kind: x.kind,
                    insertText: x.insertText?.substring(start.length),
                    insertTextMode: x.insertTextMode,
                    command: x.command
                }
                )
            }
        })
        return completionItem
    }
}

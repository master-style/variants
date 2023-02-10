import Rule from '../rule'
import MasterCSS from '../css'
import { START_SYMBOL } from '../constants/start-symbol'
import type { Declaration } from '../rule'
import { analyzeValueToken } from '../utils/analyze-value-token'

const bracketRegexp = /\{(.*)\}/

export default class extends Rule {
    static override id = 'Group' as const
    static override matches = '^(?:.+?[*_>~+])?\\{.+?\\}'
    static override unit = ''
    static override get prop() { return '' }
    override analyzeToken(token: string, values: Record<string, string | number>, globalValues: Record<string, string | number>): [string, Array<string | { value: string }>, string] {
        let i = 0
        for (; i < token.length; i++) {
            if (token[i] === '{' && token[i - 1] !== '\\') {
                break
            }
        }

        return [token.slice(0, i), ...analyzeValueToken(token.slice(i), values, globalValues)]
    }
    override getThemeProps(declaration: Declaration, css: MasterCSS): Record<string, Record<string, string>> {
        const themePropsMap: Record<string, Record<string, string>> = {}

        const addProp = (theme: string, propertyName: string) => {
            const indexOfColon = propertyName.indexOf(':')
            if (indexOfColon !== -1) {
                if (!(theme in themePropsMap)) {
                    themePropsMap[theme] = {}
                }

                const props = themePropsMap[theme]
                const name = propertyName.slice(0, indexOfColon)
                if (!(name in props)) {
                    props[name] = propertyName.slice(indexOfColon + 1)
                }
            }
        }
        const handleRule = (rule: Rule) => {
            const addProps = (theme: string, cssText: string) => {
                const cssProperties = cssText.slice(CSS.escape(rule.className).length).match(bracketRegexp)[1].split(';')
                for (const eachCssProperty of cssProperties) {
                    addProp(theme, eachCssProperty)
                }
            }

            if (this.theme) {
                const currentThemeNative = rule.natives.find(eachNative => eachNative.theme === this.theme) ?? rule.natives.find(eachNative => !eachNative.theme)
                if (currentThemeNative) {
                    addProps(this.theme, currentThemeNative.text)
                }
            } else {
                for (const eachNative of rule.natives) {
                    addProps(eachNative.theme, eachNative.text)
                }
            }
        }

        const names = []
        let currentName = ''
        const addName = () => {
            if (currentName) {
                names.push(currentName)
                currentName = ''
            }
        }

        let i = 1;
        (function analyze(end: string) {
            for (; i < declaration.value.length; i++) {
                const char = declaration.value[i]

                if (!end) {
                    if (char === ';') {
                        addName()
                        continue
                    }
                    if (char === '}') {
                        break
                    }
                }

                currentName += char

                if (end === char) {
                    if (end === '\'' || end === '"') {
                        let count = 0
                        for (let j = currentName.length - 2;; j--)  {
                            if (currentName[j] !== '\\') {
                                break
                            }
                            count++
                        }
                        if (count % 2) {
                            continue
                        }
                    }

                    break
                } else if (char in START_SYMBOL && (end !== '\'' && end !== '"')) {
                    i++
                    analyze(START_SYMBOL[char])
                }
            }
        })(undefined)
        addName()

        for (const eachName of names) {
            const result = css.create(eachName)
            if (Array.isArray(result)) {
                for (const eachRule of result) {
                    handleRule(eachRule)
                }
            } else {
                if (result) {
                    handleRule(result)
                } else {
                    addProp(this.theme ?? '', eachName)
                }
            }
        }

        return themePropsMap
    }
}
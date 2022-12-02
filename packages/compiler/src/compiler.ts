import path from 'path'
import chalk from 'chalk'
import { default as defaultOptions, CompilerOptions, CompilerSource } from './options'
import MasterCSS, { extend } from '@master/css'
import { performance } from 'perf_hooks'
import type { Config } from '@master/css'
import { pathToFileURL } from 'url'

export default class MasterCSSCompiler {

    constructor(
        public options?: CompilerOptions
    ) {
        this.options = extend(defaultOptions, options)
        this.userConfigPath = path.resolve(process.cwd(), this.options.config || 'master.css.js')
        this.initializing = this.reload()
    }

    userConfigPath: string
    initializing: Promise<any>
    css: MasterCSS
    extractions = new Set<string>()

    async reload() {
        let userConfig: Config
        try {
            if (require.cache?.[this.userConfigPath]) {
                delete require.cache[this.userConfigPath]
            }
            userConfig = (await import(pathToFileURL(this.userConfigPath).href)).default
            // eslint-disable-next-line no-empty
        } catch (err) {
            console.error(err)
        }
        this.css = new MasterCSS({ config: userConfig })
        this.extractions.clear()
    }

    extract({ name, content }: CompilerSource) {
        if (
            !name || !content
            || !this.options.accept?.({ content, name })
        ) {
            return []
        }
        const eachExtractions: string[] = []

        this.log('accepts', `  → ${path.relative(process.cwd(), name)}`)

        for (const eachNewExtraction of this.options.extract({ content, name }, this.css)) {
            if (this.extractions.has(eachNewExtraction)) {
                continue
            } else {
                this.extractions.add(eachNewExtraction)
                eachExtractions.push(eachNewExtraction)
            }
        }
        console.log(eachExtractions)
        return eachExtractions
    }

    insert(extractions) {
        const p1 = performance.now()

        /* 根據類名尋找並插入規則 ( MasterCSS 本身帶有快取機制，重複的類名不會再編譯及產生 ) */
        for (const eachExtraction of extractions) {
            this.css.findAndInsert(eachExtraction)
        }

        const spent = Math.round((performance.now() - p1) * 1000)
        const validClasses = this.css.rules.map((rule) => rule.className)

        /* 印出 Master CSS 編譯時間 */
        console.log(`[Master CSS] process ${chalk.green(extractions.length)} extractions in ${chalk.green(spent)} µs [${chalk.green(this.css.rules.length)} rules in ${chalk.green(path.join(this.options.output.dir, this.options.output.name))}]`)

        this.log('extractions', `  → ${chalk.green(extractions.length)} extractions: ${chalk.blue(extractions.join(' '))}`)
        this.log('validClasses', `  → ${chalk.green(validClasses.length)} total valid classes: ${chalk.blue(validClasses.join(' '))}`)
    }

    log(name, content) {
        if (this.options.debug === true || Array.isArray(this.options.debug) && this.options.debug.includes(name)) {
            console.log(content)
        }
    }
}
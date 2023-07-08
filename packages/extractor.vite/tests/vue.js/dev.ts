import fs from 'fs-extra'
import path from 'path'
import { ChildProcess, spawn } from 'child_process'
import cssEscape from 'shared/utils/css-escape'
import puppeteer, { type Browser, type Page } from 'puppeteer'
import stripAnsi from 'strip-ansi'
import { copy, rm } from 'shared/utils/fs'

const examplePath = path.join(__dirname, '../../../../examples/vue.js-with-static-extraction')
const tmpDir = path.join(__dirname, 'tmp/dev')

let devProcess: ChildProcess
let browser: Browser
let page: Page
let error: Error
let templatePath: string
let templateContent: string
let masterCSSConfigPath: string
let masterCSSConfigContent: string

beforeAll(async () => {
    copy(examplePath, tmpDir)
    templatePath = path.join(tmpDir, 'src/components/HelloWorld.vue')
    templateContent = fs.readFileSync(templatePath).toString()
    masterCSSConfigPath = path.join(tmpDir, 'master.css.ts')
    masterCSSConfigContent = fs.readFileSync(masterCSSConfigPath).toString()
    browser = await puppeteer.launch({ headless: 'new' })
    page = await browser.newPage()
    page.on('console', (consoleMessage) => {
        if (consoleMessage.type() === 'error') {
            error = new Error(consoleMessage.text())
        }
    })
    page.on('pageerror', (e) => error = e)
    page.on('error', (e) => error = e)
    devProcess = await new Promise((resolve) => {
        devProcess = spawn('npm', ['run', 'dev'], { cwd: tmpDir, env: { ...process.env, NODE_ENV: 'development' } })
        devProcess.stdout?.on('data', async (data) => {
            const message = stripAnsi(data.toString())
            const result = /(http:\/\/localhost:).*?([0-9]+)/.exec(message)
            if (result) {
                await page.goto(result[1] + result[2])
                resolve(devProcess)
            }
        })
        devProcess.stderr?.on('data', (data) => {
            console.error(data.toString())
        })
    })
}, 30000) // 30s timeout for the slow windows OS

it('run dev without errors', () => {
    expect(() => { if (error) throw error }).not.toThrowError()
})

it('check if the page contains [data-vite-dev-id=".virtual/master.css"]', async () => {
    expect(await page.$('[data-vite-dev-id$=".virtual/master.css"]')).toBeTruthy()
})

it('change class names and check result in the browser during HMR', async () => {
    const newClassName = 'font:' + new Date().getTime()
    const newClassNameSelector = '.' + cssEscape(newClassName)
    fs.writeFileSync(templatePath, templateContent.replace('class="card"', `class="${newClassName}"`))
    await page.waitForNetworkIdle()
    const newClassNameElementHandle = await page.waitForSelector(newClassNameSelector)
    expect(newClassNameElementHandle).not.toBeNull()
    const styleHandle = await page.$('[data-vite-dev-id$=".virtual/master.css"]')
    expect(styleHandle).not.toBeNull()
    const cssText = await page.evaluate((style: any) => (style as HTMLStyleElement)?.textContent, styleHandle)
    expect(cssText).toContain(newClassNameSelector)
})

it('change master.css.ts and check result in the browser during HMR', async () => {
    const newBtnClassName = 'btn' + new Date().getTime()
    const newBtnClassNameSelector = '.' + cssEscape(newBtnClassName)
    fs.writeFileSync(templatePath, templateContent.replace('class="card"', `class="${newBtnClassName}"`))
    await page.waitForNetworkIdle()
    const newClassNameElementHandle = await page.waitForSelector(newBtnClassNameSelector)
    expect(newClassNameElementHandle).not.toBeNull()
    // -> classes: { btn43848384: 'xxx' }
    fs.writeFileSync(masterCSSConfigPath, `
        export default { classes: { '${newBtnClassName}': 'bg:pink' } }
    `)
    await page.waitForNetworkIdle()
    const styleHandle = await page.$('[data-vite-dev-id$=".virtual/master.css"]')
    expect(styleHandle).not.toBeNull()
    const cssText = await page.evaluate((style: any) => (style as HTMLStyleElement)?.textContent, styleHandle)
    expect(cssText).toContain(newBtnClassNameSelector)
})

afterAll(async () => {
    rm(tmpDir)
    await page?.close()
    await browser?.close()
    page?.removeAllListeners()
    browser?.removeAllListeners()
    devProcess.unref()
    devProcess.kill()
    devProcess.removeAllListeners()
    devProcess.stdout?.destroy()
    devProcess.stderr?.destroy()
    devProcess.stdout?.removeAllListeners()
    devProcess.stderr?.removeAllListeners()
}) // 30s timeout for the slow windows OS
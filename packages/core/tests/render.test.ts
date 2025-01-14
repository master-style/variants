import { it, test, expect } from 'vitest'
import { MasterCSS } from '../src'

it.concurrent('class to string', () => {
    const css = new MasterCSS()
    for (const eachClass of ['text:center', 'font:32']) {
        css.add(eachClass)
    }
    expect(css.text).toEqual('.font\\:32{font-size:2rem}.text\\:center{text-align:center}')
})

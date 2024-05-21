import { it, test, expect } from 'vitest'
import { MasterCSS } from '../src'

it('calc', () => {
    expect(new MasterCSS().create('w:calc(var(--h)|/|var(--w)*100%)')?.text).toContain('width:calc(var(--h) / var(--w) * 100%)')
    expect(new MasterCSS().create('w:calc($(h)/$(w)*100)')?.text).toContain('width:calc(var(--h) / var(--w) * 100)')
    expect(new MasterCSS({ variables: { w: 1, h: 1 } }).create('w:calc($(h)/$(w)*100)')?.text).toContain('width:calc(1 / 1 * 100 / 16 * 1rem)')
    expect(new MasterCSS({ variables: { w: 1, h: '1rem' } }).create('w:calc($(h)/$(w)*100)')?.text).toContain('width:calc(1rem / 1 * 100)')
    expect(new MasterCSS().create('w:calc(var(--h)/var(--w)*100%)')?.text).toContain('width:calc(var(--h) / var(--w) * 100%)')
    expect(new MasterCSS().create('w:calc(var(--h)|/|var(--w)*100%)')?.text).toContain('width:calc(var(--h) / var(--w) * 100%)')
    expect(new MasterCSS().create('w:calc(1*2/3*100%)')?.text).toContain('width:calc(1 * 2 / 3 * 100%)')
    expect(new MasterCSS().create('w:calc(1rem*2/3*100)')?.text).toContain('width:calc(1rem * 2 / 3 * 100)')
    expect(new MasterCSS().create('w:calc(1*2rem/3*100)')?.text).toContain('width:calc(1 * 2rem / 3 * 100)')
    expect(new MasterCSS().create('w:calc(1*2/3*100em)')?.text).toContain('width:calc(1 * 2 / 3 * 100em)')
    expect(new MasterCSS().create('w:calc(1*2/3*calc(2*3*6))')?.text).toContain('width:calc(1 * 2 / 3 * calc(2 * 3 * 6) / 16 * 1rem)')
    expect(new MasterCSS().create('w:calc(5*(2*3rem+6)/3)')?.text).toContain('width:calc(5 * (2 * 3rem + 0.375rem) / 3)')
    expect(new MasterCSS().create('w:calc((2*3rem+6)/5*2)')?.text).toContain('width:calc((2 * 3rem + 0.375rem) / 5 * 2)')
    expect(new MasterCSS().create('w:calc((2*3+6)/5*2)')?.text).toContain('width:calc((2 * 3 + 6) / 5 * 2 / 16 * 1rem)')
    expect(new MasterCSS().create('w:calc((2*3+6)+5*2)')?.text).toContain('width:calc((2 * 3 + 6) / 16 * 1rem + 5 * 2 / 16 * 1rem)')
    expect(new MasterCSS().create('w:calc((6+2*(3+5rem*min(3,5)))/5*2)')?.text).toContain('width:calc((0.375rem + 2 * (0.1875rem + 5rem * min(3, 5))) / 5 * 2)')
    expect(new MasterCSS().create('w:calc((6+2*(3+5*min(3,5)))/5*2)')?.text).toContain('width:calc((6 + 2 * (3 + 5 * min(3, 5))) / 5 * 2 / 16 * 1rem)')
    expect(new MasterCSS().create('w:calc((6+2*(3+5*min(3rem,5)))/5*2)')?.text).toContain('width:calc((0.375rem + 2 * (0.1875rem + 5 * min(3rem, 0.3125rem))) / 5 * 2)')
    expect(new MasterCSS().create('w:calc((6+3+min(3rem,5))')?.text).toContain('width:calc((0.375rem + 0.1875rem + min(3rem, 0.3125rem)))')
    expect(new MasterCSS().create('leading:calc((6+3+min(3,5))')?.text).toContain('line-height:calc((6 + 3 + min(3, 5)))')
    expect(new MasterCSS().create('w:calc((6x+8x+min(3x,5x))')?.text).toContain('width:calc((24 + 32 + min(12, 20) / 16 * 1rem) / 16 * 1rem)')
    expect(new MasterCSS().create('leading:calc((6x+8x+min(3x,5x))')?.text).toContain('line-height:calc((24 + 32 + min(12, 20)))')
})
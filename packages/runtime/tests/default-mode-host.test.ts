import { it, expect } from 'vitest'
import { withRuntimeCSS } from './setup'

withRuntimeCSS([
    ':host{--base:0 0 0}',
    ':host(.dark){--base:34 33 35}',
    ':host(.light), :host{--base:255 255 255}',
], {
    modes: { dark: 'host', light: 'host' }
}, (context) => {
    it('should contain prerendering CSS text after observing', () => {
        expect(context.runtimeCSS.syntaxes[0].text).toEqual(context.preRenderedTexts.join(''))
    })
})

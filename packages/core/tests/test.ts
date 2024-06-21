import { test, expect } from 'vitest'
import { Config, MasterCSS } from '../src'

export const expectLayers = (    
    layers: {
        theme?: string
        style?: string
        utility?: string
        keyframe?: string
    },
    className: string | string[],
    customConfig?: Config
) => {
    const cssRuleText = new MasterCSS(customConfig).add(...(Array.isArray(className) ? className : [className])).text
    expect(cssRuleText).toContain(`@layer theme{${layers.theme ?? ''}}`)
    expect(cssRuleText).toContain(`@layer style{${layers.style ?? ''}}`)
    expect(cssRuleText).toContain(`@layer utility{${layers.utility ?? ''}}`)
    expect(cssRuleText).toContain(`@layer keyframe{${layers.keyframe ?? ''}}`)
}

test.todo('hidden@sm and flex ordering')
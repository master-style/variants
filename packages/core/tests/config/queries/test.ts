import { it, test, expect } from 'vitest'
import { MasterCSS } from '../../../src'

test('queries', () => {
    expect(new MasterCSS({
        queries: {
            watch: 'media (max-device-width:42mm) and (min-device-width:38mm)',
            support: {
                backdrop: 'supports (backdrop-filter:blur(0px))',
            }
        }
    }).add('hidden@watch@support-backdrop').text)
        .toBe('@supports (backdrop-filter:blur(0px)){@media (max-device-width:42mm) and (min-device-width:38mm){.hidden\\@watch\\@support-backdrop{display:none}}}')
})
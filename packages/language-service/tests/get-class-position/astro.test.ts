import dedent from 'ts-dedent'
import { expectClassPosition } from './test'

test('class in ternary operator', () => {
    const target = 'class-a'
    const contents = ['<div class:list={ isActive ? \'', target, '\' : inactiveClass }></div>']
    expectClassPosition(target, contents, 'astro')
})

test('mixed class assignment formats', () => {
    const target = ''
    const contents = [dedent`
        <div
        class:list={[
            "text:center",
            { hidden: true },
            ["block fg:blue"],
            {
                "text:center `, target, dedent`": false,
                },
            ]}
        >
        </div>
    `]
    expectClassPosition(target, contents, 'astro')
})
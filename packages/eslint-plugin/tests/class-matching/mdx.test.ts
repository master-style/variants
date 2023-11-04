import OrderRule from '../../src/rules/class-order'
import CollisionRule from '../../src/rules/class-collision'
import { RuleTester } from 'eslint'

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    }
})

ruleTester.run('mdx class order', OrderRule, {
    valid: [{ code: `<div class="bg:black fg:white f:24 m:8 p:8">Simple, basic</div>` }],
    invalid: [
        {
            code: `
            # Test
            <div class="m:8 bg:black p:8 fg:white f:24">Simple</div>`,
            output: `
            # Test
            <div class="bg:black fg:white f:24 m:8 p:8">Simple</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
            filename: 'test.mdx',
            parser: require.resolve('eslint-mdx'),
        },
    ],
})

ruleTester.run('mdx class collision', CollisionRule, {
    valid: [],
    invalid: [
        {
            code: `<div class="m:10 m:20 m:30:hover m:40@dark">Simple</div>`,
            output: `<div class="m:10 m:30:hover m:40@dark">Simple</div>`,
            errors: [
                { messageId: 'collisionClass' },
                { messageId: 'collisionClass' }
            ],
            filename: 'test.mdx',
            parser: require.resolve('eslint-mdx'),
        },
    ],
})
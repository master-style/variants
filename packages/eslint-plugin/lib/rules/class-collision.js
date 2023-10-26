const areDeclarationsEqual = require('../utils/are-declarations-equal')
const astUtil = require('../utils/ast')
const defineVisitors = require('../utils/define-visitors')
const resolveContext = require('../utils/resolve-context')
const { createValidRules } = require('@master/css-validator')

module.exports = {
    meta: {
        docs: {
            description: 'Avoid declaring the identical CSS property repeatedly',
            category: 'Stylistic Issues',
            recommended: false,
            url: 'https://beta.css.master.co/docs/code-linting#avoid-declaring-the-identical-css-property-repeatedly',
        },
        messages: {
            collisionClass: '{{message}}',
        },
        fixable: 'code'
    },
    create(context) {
        const { options, settings, config } = resolveContext(context)
        const visitNode = (node, arg = null) => {
            astUtil.parseNodeRecursive(
                node,
                arg,
                (classNames, node, originalClassNamesValue, start, end) => {
                    const sourceCode = context.getSourceCode()
                    const sourceCodeLines = sourceCode.lines
                    const nodeStartLine = node.loc.start.line
                    const nodeEndLine = node.loc.end.line
                    const ruleOfClass = {}

                    classNames
                        .forEach(eachClassName => {
                            ruleOfClass[eachClassName] = createValidRules(eachClassName, { config })[0]
                        })

                    for (let i = 0; i < classNames.length; i++) {
                        const className = classNames[i]
                        const rule = ruleOfClass[className]
                        const conflicts = []

                        if (rule) {
                            for (let j = 0; j < classNames.length; j++) {
                                const compareClassName = classNames[j]
                                const compareRule = ruleOfClass[compareClassName]
                                if (i !== j && compareRule
                                    // 比對兩個 rule 是否具有相同數量及相同屬性的 declarations
                                    && areDeclarationsEqual(rule.declarations, compareRule.declarations)
                                    && rule.stateToken === compareRule.stateToken
                                ) {
                                    conflicts.push(compareClassName)
                                }
                            }
                        }

                        if (conflicts.length > 0) {
                            const conflictClassNamesMsg = conflicts.map(x => `\`${x}\``).join(' and ')
                            let fixClassNames = originalClassNamesValue
                            for (const conflictClassName of conflicts) {
                                const regexSafe = conflictClassName.replace(/(\\|\.|\(|\)|\[|\]|\{|\}|\+|\*|\?|\^|\$|\||\/)/g, '\\$1')
                                fixClassNames = fixClassNames.replace(new RegExp(`\\s+${regexSafe}|${regexSafe}\\s+`), '')
                            }
                            context.report({
                                loc: astUtil.findLoc(className, sourceCodeLines, nodeStartLine, nodeEndLine),
                                messageId: 'collisionClass',
                                data: {
                                    message: `\`${className}\` applies the same CSS declarations as ${conflictClassNamesMsg}.
                                    `,
                                },
                                fix: function (fixer) {
                                    return fixer.replaceTextRange([start, end], fixClassNames)
                                }
                            })
                        }
                    }
                },
                false,
                false,
                settings.ignoredKeys,
                context
            )
        }
        return defineVisitors({ context, options, settings, config }, visitNode)
    },
}
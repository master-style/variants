import Layer from './layer'
import { AtFeatureComponent, SyntaxRule } from './syntax-rule'

export default class SyntaxLayer extends Layer {
    readonly ruleBy: Record<string, SyntaxRule> = {}
    rules: SyntaxRule[] = []

    /**
    * 加工插入規則
    * 1. where
    * 2. normal
    * 3. where selectors
    * 4. normal selectors
    * 5. media where
    * 6. media normal
    * 7. media where selectors
    * 8. media selectors
    * 9. media width where
    * 10. media width
    * 11. media width where selectors
    * 12. media width selectors
    */
    insert(syntaxRule: SyntaxRule) {
        if (this.getRule(syntaxRule.name, syntaxRule.fixedClass))
            return

        let index: number | undefined
        /**
         * 必須按斷點值遞增，並透過索引插入，
         * 以實現響應式先後套用的規則
         * @example <1  <2  <3  ALL  >=1 >=2 >=3
         * @description
         */
        const endIndex = this.rules.length - 1
        const { at, atToken, order, priority } = syntaxRule

        const findIndex = (startIndex: number, stopCheck?: (syntaxRule: SyntaxRule) => any, matchCheck?: (syntaxRule: SyntaxRule) => any) => {
            let i = startIndex
            for (; i <= endIndex; i++) {
                const eachSyntaxRule = this.rules[i]
                if (stopCheck?.(eachSyntaxRule))
                    return matchCheck
                        ? -1
                        : i - 1
                if (matchCheck?.(eachSyntaxRule))
                    return i
            }

            return matchCheck
                ? -1
                : i - 1
        }

        let matchStartIndex: number | undefined
        let matchEndIndex: number | undefined
        if (atToken) {
            const mediaStartIndex = this.rules.findIndex(eachSyntaxRule => eachSyntaxRule.at?.media)
            if (mediaStartIndex === -1) {
                index = endIndex + 1
            } else {
                const maxWidthFeature = at.media?.find(({ name }: any) => name === 'max-width') as AtFeatureComponent
                const minWidthFeature = at.media?.find(({ name }: any) => name === 'min-width') as AtFeatureComponent
                if (maxWidthFeature || minWidthFeature) {
                    const mediaWidthStartIndex = this.rules.findIndex(eachSyntaxRule => eachSyntaxRule.at?.media?.find(({ name }: any) => name === 'max-width' || name === 'min-width'))
                    if (mediaWidthStartIndex === -1) {
                        index = endIndex + 1
                    } else {
                        if (maxWidthFeature && minWidthFeature) {
                            /**
                             * 範圍越小 ( 越限定 越侷限 ) 越優先，
                             * 按照範圍 max-width - min-width 遞減排序
                             * find 第一個所遇到同樣 feature 且範圍值比自己大的 rule，
                             * 並插入在該 rule 之後，讓自己優先被套用
                             */
                            if (priority === -1) {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.priority !== -1,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width')
                                )
                                matchEndIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.priority !== -1
                                )
                            } else {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    undefined,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1
                                )
                                matchEndIndex = endIndex
                            }

                            if (matchStartIndex !== -1) {
                                const range = (maxWidthFeature.value) as number - (minWidthFeature.value as number)

                                let i = matchEndIndex
                                const endI = matchStartIndex
                                matchStartIndex = matchEndIndex + 1
                                for (; i >= endI; i--) {
                                    const eachSyntaxRule = this.rules[i]
                                    const eachMaxWidthFeature = eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') as AtFeatureComponent
                                    const eachMinWidthFeature = eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') as AtFeatureComponent
                                    if (!eachMaxWidthFeature || !eachMinWidthFeature) {
                                        break
                                    } else {
                                        const eachRange = (eachMaxWidthFeature.value as number) - (eachMinWidthFeature.value as number)
                                        if (eachRange < range) {
                                            matchEndIndex = i - 1
                                        } else if (eachRange === range) {
                                            matchStartIndex = i
                                        } else {
                                            break
                                        }
                                    }
                                }
                            }
                        } else if (minWidthFeature) {
                            /**
                             * find 第一個所遇到同樣 feature 且值比自己大的 rule，
                             * 並插入在該 rule 之後，讓自己優先被套用
                             */
                            if (priority === -1) {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') || eachSyntaxRule.priority !== -1,
                                    eachSyntaxRule => !eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width')
                                )
                                matchEndIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') || eachSyntaxRule.priority !== -1
                                )
                            } else {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1,
                                    eachSyntaxRule => !eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1
                                )
                                matchEndIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1
                                )
                            }

                            if (matchStartIndex !== -1) {
                                for (let i = matchEndIndex; i >= matchStartIndex; i--) {
                                    const value = (this.rules[i].at.media?.find(({ name }: any) => name === 'min-width') as AtFeatureComponent).value
                                    if (value > minWidthFeature.value) {
                                        matchEndIndex = i - 1
                                    } else if (value < minWidthFeature.value) {
                                        matchStartIndex = i + 1
                                        break
                                    }
                                }
                            }
                        } else {
                            /**
                             * find 第一個所遇到同樣 feature 且值比自己大的 rule，
                             * 並插入在該 rule 之後，讓自己優先被套用
                             */
                            if (priority === -1) {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') || eachSyntaxRule.priority !== -1,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width')
                                )
                                matchEndIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') || eachSyntaxRule.priority !== -1
                                )
                            } else {
                                matchStartIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width') && eachSyntaxRule.priority !== -1
                                )
                                matchEndIndex = findIndex(
                                    mediaWidthStartIndex,
                                    eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'min-width') && eachSyntaxRule.priority !== -1
                                )
                            }

                            if (matchStartIndex !== -1) {
                                for (let i = matchEndIndex; i >= matchStartIndex; i--) {
                                    const value = (this.rules[i].at.media?.find(({ name }: any) => name === 'max-width') as AtFeatureComponent).value
                                    if (value < maxWidthFeature.value) {
                                        matchEndIndex = i - 1
                                    } else if (value > maxWidthFeature.value) {
                                        matchStartIndex = i + 1
                                        break
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (priority === -1) {
                        matchStartIndex = mediaStartIndex
                        matchEndIndex = findIndex(
                            mediaStartIndex,
                            eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width' || name === 'min-width') || eachSyntaxRule.priority !== -1
                        )
                    } else {
                        matchStartIndex = findIndex(
                            mediaStartIndex,
                            eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width' || name === 'min-width'),
                            eachSyntaxRule => eachSyntaxRule.priority !== -1
                        )
                        matchEndIndex = findIndex(
                            mediaStartIndex,
                            eachSyntaxRule => eachSyntaxRule.at.media?.find(({ name }: any) => name === 'max-width' || name === 'min-width')
                        )
                    }
                }
            }
        } else {
            if (priority === -1) {
                matchStartIndex = 0
                matchEndIndex = findIndex(
                    0,
                    eachSyntax => eachSyntax.atToken || eachSyntax.priority !== -1
                )
            } else {
                matchStartIndex = findIndex(
                    0,
                    eachSyntax => eachSyntax.atToken,
                    eachSyntax => eachSyntax.priority !== -1
                )
                matchEndIndex = findIndex(
                    0,
                    eachSyntax => eachSyntax.atToken
                )
            }
        }

        if (index === undefined && matchEndIndex !== undefined && matchStartIndex !== undefined) {
            if (matchStartIndex === -1) {
                index = matchEndIndex + 1
            } else {
                if (priority === -1) {
                    for (let i = matchStartIndex; i <= matchEndIndex; i++) {
                        const currentSyntaxRule = this.rules[i]
                        if (currentSyntaxRule.order >= order) {
                            index = i
                            break
                        }
                    }
                } else {
                    for (let i = matchStartIndex; i <= matchEndIndex; i++) {
                        const currentSyntaxRule = this.rules[i]
                        if (currentSyntaxRule.priority < priority) {
                            index = i
                            break
                        } else if (currentSyntaxRule.priority === priority) {
                            if (currentSyntaxRule.order >= order) {
                                index = i
                                break
                            }
                        } else {
                            index = i + 1
                        }
                    }
                }

                if (index === undefined) {
                    index = matchEndIndex + 1
                }
            }
        }
        super.insert(syntaxRule, index)
        this.css.themeLayer.insert(syntaxRule)
        this.css.keyframeLayer.insert(syntaxRule)
        syntaxRule.definition.insert?.call(syntaxRule)
        return index
    }

    delete(className: string, fixedClass?: string): SyntaxRule {
        const syntaxRule = super.delete(className, fixedClass) as SyntaxRule
        if (!syntaxRule) return syntaxRule
        this.css.themeLayer.delete(syntaxRule)
        this.css.keyframeLayer.delete(syntaxRule)
        syntaxRule.definition.delete?.call(syntaxRule, syntaxRule.name)
        return syntaxRule
    }

    getRule(className: string, fixedClass?: string) {
        return this.ruleBy[this.getName(className, fixedClass)]
    }
}
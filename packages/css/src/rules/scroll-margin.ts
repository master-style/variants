export const scrollMargin = {
    id: 'ScrollMargin' as const,
    matches: '^scroll-m(?:[xytblr]|argin(?:-(?:top|bottom|left|right))?)?:.',
    get prop() { return '' },
    get(declaration): { [key: string]: any } {
        if (this.prefix.slice(-3, -2) === 'm') {
            switch (this.prefix.slice(-2, -1)) {
            case 'x':
                return {
                    'scroll-margin-left': declaration,
                    'scroll-margin-right': declaration
                }
            case 'y':
                return {
                    'scroll-margin-top': declaration,
                    'scroll-margin-bottom': declaration
                }
            case 'l':
                return {
                    'scroll-margin-left': declaration
                }
            case 'r':
                return {
                    'scroll-margin-right': declaration
                }
            case 't':
                return {
                    'scroll-margin-top': declaration
                }
            case 'b':
                return {
                    'scroll-margin-bottom': declaration
                }
            }
        } else {
            return {
                [this.prefix.replace(/-m(?!argin)/, '-' + 'margin').slice(0, -1)]: declaration
            }
        }
    },
    get order(): number {
        return (this.prefix === 'scroll-margin:' || this.prefix === 'scroll-m:') ? -1 : 0
    }
}
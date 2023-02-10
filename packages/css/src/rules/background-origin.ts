import Rule from '../rule'

export default class extends Rule {
    static override id = 'BackgroundOrigin' as const
    static override matches = '^(?:bg|background):(?:$values)(?!\\|)'
}
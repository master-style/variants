import { CSSLanguageService } from '../../src'
import createDoc from '../../src/utils/create-doc'
import { expectClassPosition } from './test'

test('empty string with single quote', () => {
    const target = ''
    const contents = ['export default () => <div className=\'', target, '\'></div>']
    expectClassPosition(target, contents, 'tsx')
})

test('empty string with double quote', () => {
    const target = ''
    const contents = ['export default () => <div className="', target, '"></div>']
    expectClassPosition(target, contents, 'tsx')
})

test('empty binding', () => {
    const contents = ['export default () => <div className={', '', '}></div>']
    const doc = createDoc('tsx', contents.join(''))
    const languageService = new CSSLanguageService()
    expect(languageService.getClassPosition(doc, { line: 0, character: contents[0].length })).toBeUndefined()
})

test('empty string binding with double quote', () => {
    const target = ''
    const contents = ['export default () => <div className={"', target, '"}></div>']
    expectClassPosition(target, contents, 'tsx')
})

test('empty clsx', () => {
    const contents = ['export default () => <div className={clsx(', '', ')}></div>']
    const doc = createDoc('tsx', contents.join(''))
    const languageService = new CSSLanguageService()
    expect(languageService.getClassPosition(doc, { line: 0, character: contents[0].length })).toBeUndefined()
})

test('two classes in clsx fn', () => {
    const target = 'class-b'
    const contents = ['export default () => <div className={clsx("class-a","', target, '")}></div>']
    expectClassPosition(target, contents, 'tsx')
})

test('quote in clsx fn', () => {
    const target = `content:''`
    const contents = ['export default () => <div className={clsx("class-a","', target, '")}></div>']
    expectClassPosition(target, contents)
})

test('template literal and newlines', () => {
    const target = `class-e`
    const contents = ['export default () => <div className={clsx("class-a class-b",`class-c class-d\n', target, '`)}></div>']
    expectClassPosition(target, contents)
})
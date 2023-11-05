import Tabs, { Tab, TabBadge } from 'websites-shared/components/Tabs'
import { queryDictionary } from 'websites-shared/dictionaries';
import DocLayout from '~/layouts/doc'
import NuxtjsSvg from 'websites-shared/images/frameworks/nuxtjs.svg'

export default async function Layout(props: any) {
    const $ = await queryDictionary(props.params.locale)
    return (
        /* @ts-expect-error server component */
        <DocLayout {...props}
            metadata={{
                title: 'Set up Master CSS in Nuxt.js',
                description: 'Guide to setting up Master CSS in your Nuxt.js project.',
                category: 'Installation'
            }}
            backOnClickCategory='/docs/installation'
            icon={{
                Element: NuxtjsSvg,
                class: 'w:105'
            }}
        >
            <Tabs className="mb:30">
                <Tab href='/docs/installation/nuxtjs'>{$('Progressive Rendering')} <TabBadge>{$('Recommanded')}</TabBadge></Tab>
                <Tab href='/docs/installation/nuxtjs/runtime-rendering'>{$('Runtime Rendering')}</Tab>
                <Tab href='/docs/installation/nuxtjs/static-extraction'>{$('Static Extraction')}</Tab>
            </Tabs>
            {props.children}
        </DocLayout >
    )
}
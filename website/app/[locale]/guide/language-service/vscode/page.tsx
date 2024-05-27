import Layout from '~/layouts/reference'
import pageCategories from '~/data/guide-categories.json'
import metadata from './metadata'
import Content from './content.mdx'
import { generate } from '~/utils/metadata'

export const dynamic = 'force-static'
export const revalidate = false

export async function generateMetadata(props: any, parent: any) {
    return await generate(metadata, props, parent)
}

export default async function Page(props: any) {
    return (
        <Layout {...props} pageCategories={pageCategories} pageDirname={__dirname}
            metadata={metadata}
            backOnClickCategory='/guide/language-service'
        >
            <Content />
        </Layout >
    )
}
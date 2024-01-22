import DocHeader from '~/components/DocHeader'
import DocSidebar from '~/components/DocSidebar'

export default async function Layout(props: any) {
    const { children, params } = props
    return <>
        <DocHeader contained />
        <DocSidebar locale={params.locale} />
        {children}
    </>
}
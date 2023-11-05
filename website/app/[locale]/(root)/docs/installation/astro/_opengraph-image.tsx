import { Props } from 'websites-shared/types/Props'
import create from '~/og-image'
import metadata from './metadata'
import Icon from 'websites-shared/images/frameworks/astro.svg'

export const alt = metadata.title
export const contentType = 'image/jpg'
export const runtime = 'nodejs'

export default (props: Props) => create({
    props,
    metadata,
    title: 'Runtime Rendering',
    icon: <Icon width="256" />
})
import { Props } from 'websites-shared/types/Props'
import create from '~/og-image'
import metadata from './metadata'
import Icon from 'websites-shared/images/frameworks/vuejs.svg'

export const alt = metadata.title
export const contentType = 'image/jpg'
export const runtime = 'nodejs'

export default (props: Props) => create({
    props,
    metadata,
    title: 'Static Extraction',
    icon: <Icon width="192" />
})
import { COLOR, DASH, OUTLINE } from './constants/css-property-keyword';
import { Style } from '@master/style';

export class OutlineColorStyle extends Style {
    static override properties = [OUTLINE + DASH + COLOR];
}
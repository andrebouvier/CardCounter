import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import {
  formatZenTag,
  ZEN_TAG_RANK_SUBTITLE,
  ZEN_TAGS_DESC,
  type ZenTag,
} from '../types/counter';

export type ZenCountButtonGridProps = {
  onTag: (tag: ZenTag) => void;
  disabled?: boolean;
};

function variantClass(tag: ZenTag): string {
  if (tag > 0) {
    return 'zen-tag-btn--pos';
  }
  if (tag === 0) {
    return 'zen-tag-btn--zero';
  }
  return 'zen-tag-btn--neg';
}

const ZEN_TAG_DISPLAY_CARDS: Readonly<Record<ZenTag, readonly string[]>> = {
  2: ['4s', '5h', '6d'],
  1: ['2s', '3h', '7d'],
  0: ['8s', '9h'],
  [-1]: ['As'],
  [-2]: ['Ts', 'Jh', 'Qd', 'Kc'],
};

export function ZenCountButtonGrid({ onTag, disabled }: ZenCountButtonGridProps) {
  return (
    <div className="zen-grid" role="group" aria-label="Zen count card tags">
      {ZEN_TAGS_DESC.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`zen-tag-btn ${variantClass(tag)}`}
          disabled={disabled}
          onClick={() => onTag(tag)}
          aria-label={`${ZEN_TAG_RANK_SUBTITLE[tag]} tags ${formatZenTag(tag)}`}
        >
          <div className="zen-tag-btn__cards" aria-hidden="true">
            {ZEN_TAG_DISPLAY_CARDS[tag].map((cardCode) => (
              <Card
                key={`${tag}-${cardCode}`}
                card={cardCode}
                height="34px"
                className="zen-tag-btn__card"
              />
            ))}
          </div>
          <div className="zen-tag-btn__value">{formatZenTag(tag)}</div>
        </button>
      ))}
    </div>
  );
}

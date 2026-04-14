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
        >
          <div className="zen-tag-btn__value">{formatZenTag(tag)}</div>
          <div className="zen-tag-btn__ranks">{ZEN_TAG_RANK_SUBTITLE[tag]}</div>
        </button>
      ))}
    </div>
  );
}

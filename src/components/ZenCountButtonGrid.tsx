import {
  formatZenTag,
  ZEN_TAG_RANK_SUBTITLE,
  ZEN_TAGS_DESC,
  type ZenTag,
} from '../types/counter';
import twoOfHearts from '../assets/2_of_hearts.svg';
import threeOfClubs from '../assets/3_of_clubs.svg';
import fourOfDiamonds from '../assets/4_of_diamonds.svg';
import fiveOfSpades from '../assets/5_of_spades.svg';
import sixOfDiamonds from '../assets/6_of_diamonds.svg';
import sevenOfClubs from '../assets/7_of_clubs.svg';
import eightOfHearts from '../assets/8_of_hearts.svg';
import nineOfClubs from '../assets/9_of_clubs.svg';
import tenOfDiamonds from '../assets/10_of_diamonds.svg';
import aceOfSpades from '../assets/ace_of_spades2.svg';
import jackOfClubs from '../assets/jack_of_clubs2.svg';
import queenOfHearts from '../assets/queen_of_hearts2.svg';
import kingOfSpades from '../assets/king_of_spades2.svg';

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
  2: [fourOfDiamonds, fiveOfSpades, sixOfDiamonds],
  1: [twoOfHearts, threeOfClubs, sevenOfClubs],
  0: [eightOfHearts, nineOfClubs],
  [-1]: [aceOfSpades],
  [-2]: [tenOfDiamonds, jackOfClubs, queenOfHearts, kingOfSpades],
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
            {ZEN_TAG_DISPLAY_CARDS[tag].map((cardSrc, index) => (
              <img
                key={`${tag}-${index}`}
                src={cardSrc}
                alt=""
                width={24}
                height={34}
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

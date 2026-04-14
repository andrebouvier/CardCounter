/** Zen Count running-count contribution per card bucket. */
export type ZenTag = 2 | 1 | 0 | -1 | -2;

/** Visual + tap order: high positives first, then zero, then negatives (matches common charts). */
export const ZEN_TAGS_DESC: readonly ZenTag[] = [2, 1, 0, -1, -2];

/** Subtitle under each tag button: which ranks use this bucket. */
export const ZEN_TAG_RANK_SUBTITLE: Readonly<Record<ZenTag, string>> = {
  2: '4, 5, 6',
  1: '2, 3, 7',
  0: '8, 9',
  [-1]: 'A',
  [-2]: '10 / J / Q / K',
};

export function formatZenTag(tag: ZenTag): string {
  if (tag > 0) {
    return `+${tag}`;
  }
  return String(tag);
}

/** Running-count delta equals the tag in Zen Count. */
export function zenRunningDelta(tag: ZenTag): number {
  return tag;
}

/** Ranks shown on the compact reference strip (10 = all 10-value cards). */
export type DisplayRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export const DISPLAY_RANKS: readonly DisplayRank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

export function zenTagForDisplayRank(rank: DisplayRank): ZenTag {
  switch (rank) {
    case 'A':
      return -1;
    case '2':
    case '3':
    case '7':
      return 1;
    case '4':
    case '5':
    case '6':
      return 2;
    case '8':
    case '9':
      return 0;
    case '10':
      return -2;
    default: {
      const _exhaustive: never = rank;
      return _exhaustive;
    }
  }
}

export type CountReadout = {
  runningCount: number;
  trueCount?: number | null;
  decksRemaining?: number | null;
};

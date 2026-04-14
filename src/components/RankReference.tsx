import {
  DISPLAY_RANKS,
  formatZenTag,
  zenTagForDisplayRank,
} from '../types/counter';

export function RankReference() {
  return (
    <div className="rank-ref">
      <div className="rank-ref__title">Rank → tag</div>
      <div className="rank-ref__grid">
        {DISPLAY_RANKS.map((rank) => {
          const tag = zenTagForDisplayRank(rank);
          return (
            <div key={rank} className="rank-ref__cell">
              <span className="rank-ref__rank">{rank}</span>
              <span className="rank-ref__tag">{formatZenTag(tag)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

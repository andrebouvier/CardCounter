declare module '@heruka_urgyen/react-playing-cards/lib/TcN' {
  import type { CSSProperties, FC } from 'react';

  export type PlayingCardProps = {
    card: string;
    height?: string;
    back?: boolean;
    front?: boolean;
    className?: string;
    style?: CSSProperties;
  };

  const Card: FC<PlayingCardProps>;
  export default Card;
}

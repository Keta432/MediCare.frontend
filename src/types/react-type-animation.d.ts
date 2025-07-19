import * as React from 'react';

declare module 'react-type-animation' {
  interface TypeAnimationProps {
    sequence: (string | number)[];
    wrapper?: keyof JSX.IntrinsicElements;
    speed?: number;
    repeat?: number;
    className?: string;
  }

  export const TypeAnimation: React.FC<TypeAnimationProps>;
} 
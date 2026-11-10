import type * as React from 'react';

type ModelViewerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'ar-placement'?: 'floor' | 'wall';
  'ar-scale'?: 'auto' | 'fixed';
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'shadow-intensity'?: string;
  exposure?: string;
  'environment-image'?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}
export {};

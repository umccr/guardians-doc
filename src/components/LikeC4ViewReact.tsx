/**
 * LikeC4ViewReact.tsx
 *
 * Thin React wrapper around the LikeC4 view component.
 * Imported by LikeC4Diagram.astro with client:only="react".
 *
 * The `likec4:react` virtual module is provided by LikeC4VitePlugin at build/dev time.
 */

// @ts-expect-error – virtual module resolved by LikeC4VitePlugin
import { LikeC4View } from 'likec4:react';

interface Props {
  viewId: string;
  interactive?: boolean;
}

export default function LikeC4ViewReact({ viewId, interactive = false }: Props) {
  return (
    <LikeC4View
      viewId={viewId}
      browser={true}
      pannable={interactive}
      zoomable={interactive}
      injectFontCss={true}
      style={{ width: '100%', minHeight: '300px' }}
    />
  );
}

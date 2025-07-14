// src/components/ui/ChartContainer.tsx
// A temporary stub so pages can compile while you choose a real chart library.
// Accepts any `config` bag to avoid TS prop errors in page components.

import React from "react";

export interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Arbitrary chart-config object; shape is intentionally loose. */
  config?: Record<string, unknown>;
}

/**
 * Wrapper that will later be replaced by a fully-featured chart component.
 * For now it just renders its children inside a div so that pages compile.
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={className}>{children}</div>;
};

export default ChartContainer;

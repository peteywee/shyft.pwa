"use client";

import { ReactNode } from "react";

/**
 * Minimal stub: keeps the existing dashboard import happy but
 * renders nothing and has zero runtime dependencies.
 */
export const ChartContainer = ({
  children,
  className,
  config,          // optional, ignored
}: {
  children: ReactNode;
  className?: string;
  config?: unknown;
}) => <div className={className}>{children}</div>;

export const ChartTooltip = (_props: any) => null;
export const ChartTooltipContent = (_props: any) => null;

export default ChartContainer;

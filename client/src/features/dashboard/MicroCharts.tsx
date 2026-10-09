import React, { memo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "../../components/ui/Skeleton";

interface MicroLineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  strokeColor?: string;
  isLoading?: boolean;
  height?: string;
}

export const MicroLineChart = memo(function MicroLineChart({
  data,
  xKey,
  yKey,
  strokeColor = "var(--color-primary)",
  isLoading = false,
  height = "var(--dash-chart-height, 60px)",
}: MicroLineChartProps) {
  if (isLoading) {
    return (
      <div data-testid="micro-chart-skeleton" style={{ height, width: "100%" }}>
        <Skeleton variant="rectangular" width="100%" height={height} />
      </div>
    );
  }

  return (
    <div data-testid="micro-line-chart" style={{ height, width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 5, left: -5, bottom: -8 }}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" vertical={false} horizontal={true} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-text-secondary)"
            fontSize={8}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            fontSize={8}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
              fontSize: "8px",
            }}
            labelStyle={{ color: "var(--color-text)", fontWeight: 600, fontSize: "8px" }}
            itemStyle={{ fontSize: "8px" }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MicroLineChart.displayName = "MicroLineChart";

interface MicroBarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  barColor?: string;
  barColors?: string[]; // Array of colors per bar (for alternating colors)
  layout?: "horizontal" | "vertical";
  isLoading?: boolean;
  height?: string;
}

export const MicroBarChart = memo(function MicroBarChart({
  data,
  xKey,
  yKey,
  barColor = "var(--color-primary)",
  barColors,
  layout = "vertical",
  isLoading = false,
  height = "var(--dash-chart-height, 60px)",
}: MicroBarChartProps) {
  if (isLoading) {
    return (
      <div data-testid="micro-chart-skeleton" style={{ height, width: "100%" }}>
        <Skeleton variant="rectangular" width="100%" height={height} />
      </div>
    );
  }

  return (
    <div data-testid="micro-bar-chart" style={{ height, width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={{ top: 2, right: 2, left: -5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" horizontal={layout === "vertical"} vertical={layout === "horizontal"} />
          <XAxis
            type={layout === "vertical" ? "number" : "category"}
            dataKey={layout === "vertical" ? yKey : xKey}
            stroke="var(--color-text-secondary)"
            fontSize={7}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type={layout === "vertical" ? "category" : "number"}
            dataKey={layout === "vertical" ? xKey : yKey}
            width={80}
            stroke="var(--color-text-secondary)"
            fontSize={8}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
              fontSize: "8px",
            }}
            formatter={(value) => [value, layout === "vertical" ? "und" : ""]}
          />
          <Bar dataKey={layout === "vertical" ? yKey : xKey} radius={[0, 2, 2, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || barColors?.[index] || barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

MicroBarChart.displayName = "MicroBarChart";

interface MicroAreaChartSeries {
  key: string;
  color: string;
}

interface MicroAreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: MicroAreaChartSeries[];
  isLoading?: boolean;
  height?: string;
}

export const MicroAreaChart = memo(function MicroAreaChart({
  data,
  xKey,
  series,
  isLoading = false,
  height = "var(--dash-chart-height, 60px)",
}: MicroAreaChartProps) {
  if (isLoading) {
    return (
      <div data-testid="micro-chart-skeleton" style={{ height, width: "100%" }}>
        <Skeleton variant="rectangular" width="100%" height={height} />
      </div>
    );
  }

  return (
    <div data-testid="micro-area-chart" style={{ height, width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 5, left: -5, bottom: -8 }}>
          <defs>
            {series.map((s, index) => (
              <linearGradient key={s.key} id={`${s.key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" vertical={false} horizontal={true} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-text-secondary)"
            fontSize={8}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            fontSize={8}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
              fontSize: "8px",
            }}
            labelStyle={{ color: "var(--color-text)", fontWeight: 600, fontSize: "8px" }}
            itemStyle={{ fontSize: "8px" }}
          />
          {series.map((s, index) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stackId="1"
              fill={`url(#${s.key}Gradient)`}
              stroke={s.color}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

MicroAreaChart.displayName = "MicroAreaChart";
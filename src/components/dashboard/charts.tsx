"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#0154AA";

const STATUS_COLORS: Record<string, string> = {
  applied: "#0154AA",
  reviewed: "#3b82f6",
  interview: "#8b5cf6",
  offer: "#10b981",
  rejected: "#ef4444",
};

export function ProfileViewsChart({ data }: { data: { label: string; views: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#737A91" }}
          interval={2}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#737A91" }}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          cursor={{ stroke: BRAND, strokeOpacity: 0.2 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke={BRAND}
          strokeWidth={2}
          fill="url(#viewsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ApplicationStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No applications yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.status.charAt(0).toUpperCase() + d.status.slice(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#737A91" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#737A91" }}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "rgba(1,84,170,0.06)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? BRAND} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

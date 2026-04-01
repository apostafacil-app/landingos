'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface LeadsChartProps {
  data: { date: string; leads: number }[]
}

export function LeadsChart({ data }: LeadsChartProps) {
  if (data.every(d => d.leads === 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        Nenhum lead captado ainda. Publique sua primeira página para começar.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.50 0.22 264)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="oklch(0.50 0.22 264)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.03 264)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.06 264)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.06 264)' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid oklch(0.90 0.03 264)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(value) => [value, 'Leads']}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="oklch(0.50 0.22 264)"
          strokeWidth={2}
          fill="url(#leadGradient)"
          dot={false}
          activeDot={{ r: 4, fill: 'oklch(0.50 0.22 264)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

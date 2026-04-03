/* 8.4 — Skeleton Loading: renderiza enquanto dashboard/page.tsx busca dados */
import React from 'react'

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded bg-muted animate-pulse ${className}`} style={style} />
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border-l-4 border-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-10 h-10 rounded-lg shrink-0 ml-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Credits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-5">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            {/* Barras do gráfico */}
            <div className="flex items-end gap-2 h-32 pt-4">
              {[60, 85, 40, 70, 55, 90, 65].map((h, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-2.5 w-6" />
              ))}
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col">
            <Skeleton className="h-4 w-24 mb-1.5" />
            <Skeleton className="h-3 w-36 mb-5" />
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg mt-5" />
          </div>
        </div>

        {/* Tabela de páginas */}
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center px-5 py-4 border-b border-border last:border-0 gap-4">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="ml-auto flex gap-8">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

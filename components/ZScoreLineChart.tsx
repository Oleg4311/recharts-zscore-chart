'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DotProps,
} from 'recharts'

type DataPoint = {
  name: string
  pv: number
  uv: number
  pvZ?: number
  uvZ?: number
}

const rawData: DataPoint[] = [
  { name: 'Page A', pv: 2400, uv: 4000 },
  { name: 'Page B', pv: 1398, uv: 3000 },
  { name: 'Page C', pv: 9800, uv: 2000 },
  { name: 'Page D', pv: 3908, uv: 2780 },
  { name: 'Page E', pv: 4800, uv: 1890 },
  { name: 'Page F', pv: 3800, uv: 2390 },
  { name: 'Page G', pv: 4300, uv: 3490 },
]

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function stdDev(arr: number[]) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / arr.length)
}

function addZScore(data: DataPoint[], key: 'pv' | 'uv'): DataPoint[] {
  const values = data.map((d) => d[key])
  const m = mean(values)
  const sd = stdDev(values)

  return data.map((d) => ({
    ...d,
    [`${key}Z`]: (d[key] - m) / sd,
  }))
}

const processedData: DataPoint[] = addZScore(addZScore(rawData, 'pv'), 'uv')

interface DotPropsWithPayload extends DotProps {
  payload: DataPoint
}

const renderCustomDot = (zKey: 'pvZ' | 'uvZ', color: string) => (props: DotPropsWithPayload) => {
  const { cx, cy, payload } = props
  const z = payload[zKey]
  const key = `dot-${zKey}-${cx}-${cy}`

  if (cx == null || cy == null) {
    return <circle key={key} cx={0} cy={0} r={0} fill="transparent" />
  }

  const isOutlier = Math.abs(z ?? 0) > 1

  return (
    <circle
      key={key}
      cx={cx}
      cy={cy}
      r={isOutlier ? 6 : 4}
      stroke={isOutlier ? 'red' : undefined}
      strokeWidth={isOutlier ? 2 : 0}
      fill={isOutlier ? 'white' : color}
    />
  )
}

export default function ZScoreLineChart() {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2 className="text-xl font-bold mb-2">Z-Score Highlighted Line Chart</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: any, name: string, props: any) => {
              const zKey = `${name}Z`
              const z = props.payload?.[zKey]
              return [`${value} (z: ${z?.toFixed(2)})`, name]
            }}
          />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#8884d8"
            strokeWidth={2}
            dot={renderCustomDot('pvZ', '#8884d8')}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="uv"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={renderCustomDot('uvZ', '#82ca9d')}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

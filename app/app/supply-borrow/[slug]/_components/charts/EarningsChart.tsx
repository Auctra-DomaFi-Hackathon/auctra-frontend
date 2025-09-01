'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

interface EarningsData {
  date: string
  earnings: number
  timestamp: number
}

interface TokenDistribution {
  name: string
  value: number
  percentage: number
}

interface EarningsChartProps {
  domainName: string
  totalEarnings: number
}

const MOCK_EARNINGS_DATA: EarningsData[] = [
  { date: '2024-01', earnings: 145.32, timestamp: 1704067200000 },
  { date: '2024-02', earnings: 189.67, timestamp: 1706745600000 },
  { date: '2024-03', earnings: 223.45, timestamp: 1709251200000 },
  { date: '2024-04', earnings: 267.89, timestamp: 1711929600000 },
  { date: '2024-05', earnings: 312.56, timestamp: 1714521600000 },
  { date: '2024-06', earnings: 398.23, timestamp: 1717200000000 },
  { date: '2024-07', earnings: 445.67, timestamp: 1719792000000 },
  { date: '2024-08', earnings: 523.89, timestamp: 1722470400000 },
]

const MOCK_TOKEN_DISTRIBUTION: TokenDistribution[] = [
  { name: 'USDC', value: 2450.67, percentage: 58.3 },
  { name: 'USDT', value: 1234.89, percentage: 29.4 },
  { name: 'DAI', value: 516.44, percentage: 12.3 },
]

const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#3b82f6',
  accent: '#60a5fa',
  background: '#f8fafc',
  grid: '#e2e8f0',
  text: '#475569',
}

const PIE_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']

export default function EarningsChart({ domainName, totalEarnings }: EarningsChartProps) {
  const formattedData = useMemo(() => {
    return MOCK_EARNINGS_DATA.map(item => ({
      ...item,
      formattedDate: new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      })
    }))
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-blue-600">
            Earnings: {formatTooltipCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-blue-600">
            {formatTooltipCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Supply Earnings Trend
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monthly earnings from {domainName} supply positions
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={CHART_COLORS.grid}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Earnings</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(totalEarnings)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Token Distribution
          </CardTitle>
          <p className="text-sm text-gray-600">
            Supply earnings breakdown by token type
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_TOKEN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {MOCK_TOKEN_DISTRIBUTION.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {MOCK_TOKEN_DISTRIBUTION.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
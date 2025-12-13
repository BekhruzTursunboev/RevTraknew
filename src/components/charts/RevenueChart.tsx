import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types';
import { analyticsService } from '../../utils/analytics';

interface RevenueChartProps {
  transactions: Transaction[];
}

export default function RevenueChart({ transactions }: RevenueChartProps) {
  const data = analyticsService.getTransactionsByDateRange(transactions, 30);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6',
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
        />
        <Legend 
          wrapperStyle={{ color: '#9CA3AF' }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#00E65C" 
          strokeWidth={2}
          dot={{ fill: '#00E65C', r: 4 }}
          name="Revenue"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#EF4444" 
          strokeWidth={2}
          dot={{ fill: '#EF4444', r: 4 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}



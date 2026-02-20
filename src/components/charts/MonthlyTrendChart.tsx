import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types';
import { analyticsService } from '../../utils/analytics';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
}

export default function MonthlyTrendChart({ transactions }: MonthlyTrendChartProps) {
  const data = analyticsService.getMonthlyTrend(transactions);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short' })}
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
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <Legend 
          wrapperStyle={{ color: '#9CA3AF' }}
        />
        <Bar dataKey="revenue" fill="#00E65C" name="Revenue" />
        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
        <Bar dataKey="profit" fill="#0079E6" name="Profit" />
      </BarChart>
    </ResponsiveContainer>
  );
}





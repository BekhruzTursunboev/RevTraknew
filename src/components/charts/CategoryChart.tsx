import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../types';
import { analyticsService } from '../../utils/analytics';

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = ['#0079E6', '#00E65C', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const categoryData = analyticsService.getTransactionsByCategory(transactions);
  const data = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}


import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '../../types';
import { analyticsService } from '../../utils/analytics';

interface TaskCompletionChartProps {
  tasks: Task[];
}

export default function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const completionRate = analyticsService.getTaskCompletionRate(tasks);
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;

  const data = [
    { name: 'Completed', value: completionRate, fill: '#00E65C' },
    { name: 'Remaining', value: 100 - completionRate, fill: '#374151' },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            fill="#00E65C"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center">
        <p className="text-3xl font-bold text-accent-400">{completionRate.toFixed(1)}%</p>
        <p className="text-sm text-gray-400 mt-1">
          {completed} of {total} tasks completed
        </p>
      </div>
    </div>
  );
}


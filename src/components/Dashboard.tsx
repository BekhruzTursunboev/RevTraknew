import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Sparkles
} from 'lucide-react';
import { AppData } from '../types';
import { analyticsService } from '../utils/analytics';
import { exportService } from '../utils/export';
import { aiService } from '../utils/ai';
import RevenueChart from './charts/RevenueChart';
import CategoryChart from './charts/CategoryChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import TaskCompletionChart from './charts/TaskCompletionChart';

interface DashboardProps {
  data: AppData;
  updateData: () => void;
}

export default function Dashboard({ data, updateData }: DashboardProps) {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    updateData();
    const interval = setInterval(() => {
      updateData();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const overdue = analyticsService.getOverdueTasks(data.tasks);
    const upcoming = analyticsService.getUpcomingDeadlines(data.tasks, 3);
    const anomalies = aiService.detectAnomalies(data.transactions);
    
    const newNotifications: string[] = [];
    
    if (overdue.length > 0) {
      newNotifications.push(`⚠️ ${overdue.length} task(s) are overdue`);
    }
    
    if (upcoming.length > 0) {
      newNotifications.push(`⏰ ${upcoming.length} task(s) due in the next 3 days`);
    }
    
    if (anomalies.length > 0) {
      newNotifications.push(`🔍 ${anomalies.length} unusual transaction(s) detected`);
    }
    
    setNotifications(newNotifications);
  }, [data]);

  const revenue = analyticsService.getRevenue(data.transactions);
  const expenses = analyticsService.getExpenses(data.transactions);
  const profit = analyticsService.getNetProfit(data.transactions);
  const completionRate = analyticsService.getTaskCompletionRate(data.tasks);
  const overdueTasks = analyticsService.getOverdueTasks(data.tasks);
  const upcomingDeadlines = analyticsService.getUpcomingDeadlines(data.tasks, 7);
  const recommendations = aiService.getTaskRecommendations(data.tasks);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportService.exportToCSV(data, 'revtrak-dashboard');
    } else {
      exportService.exportToPDF(data, 'revtrak-dashboard');
    }
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/10',
      borderColor: 'border-accent-500/30',
      change: '+12.5%',
    },
    {
      label: 'Total Expenses',
      value: `$${expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      change: '-5.2%',
    },
    {
      label: 'Net Profit',
      value: `$${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: profit >= 0 ? 'text-accent-400' : 'text-red-400',
      bgColor: profit >= 0 ? 'bg-accent-500/10' : 'bg-red-500/10',
      borderColor: profit >= 0 ? 'border-accent-500/30' : 'border-red-500/30',
      change: profit >= 0 ? '+8.3%' : '-3.1%',
    },
    {
      label: 'Task Completion',
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30',
      change: `${completionRate > 80 ? '+' : ''}${(completionRate - 70).toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-sm md:text-base text-gray-400">Real-time financial and workflow analytics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 text-sm md:text-base"
          >
            <Download size={16} className="md:w-[18px] md:h-[18px]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors bg-glow text-sm md:text-base"
          >
            <Download size={16} className="md:w-[18px] md:h-[18px]" />
            <span>Export PDF</span>
          </button>
        </div>
      </motion.div>

      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          {notifications.map((notif, idx) => (
            <div
              key={idx}
              className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={18} />
              <span>{notif}</span>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                ${stat.bgColor} ${stat.borderColor} border rounded-xl p-6
                hover:scale-105 transition-transform duration-200
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg bg-gray-900/50`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">{stat.label}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Revenue & Expenses Trend
          </h3>
          <RevenueChart transactions={data.transactions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Category Breakdown
          </h3>
          <CategoryChart transactions={data.transactions} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Monthly Performance
          </h3>
          <MonthlyTrendChart transactions={data.transactions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} />
            Task Completion
          </h3>
          <TaskCompletionChart tasks={data.tasks} />
        </motion.div>
      </div>

      {(overdueTasks.length > 0 || upcomingDeadlines.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} />
            Deadline Alerts
          </h3>
          <div className="space-y-3">
            {overdueTasks.length > 0 && (
              <div>
                <h4 className="text-red-400 font-medium mb-2">Overdue Tasks</h4>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{task.title}</p>
                        <p className="text-sm text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                        Overdue
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingDeadlines.length > 0 && (
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">Upcoming Deadlines</h4>
                <div className="space-y-2">
                  {upcomingDeadlines.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{task.title}</p>
                        <p className="text-sm text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'urgent' 
                          ? 'bg-red-500/20 text-red-400'
                          : task.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} />
            AI Task Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 flex items-center justify-between hover:bg-primary-500/20 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{task.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'urgent' 
                        ? 'bg-red-500/20 text-red-400'
                        : task.priority === 'high'
                        ? 'bg-orange-500/20 text-orange-400'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}


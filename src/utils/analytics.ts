import { Transaction, Task } from '../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export const analyticsService = {
  getRevenue(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.category === 'revenue' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
  },

  getExpenses(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.category !== 'revenue' && t.status === 'completed')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  },

  getNetProfit(transactions: Transaction[]): number {
    return this.getRevenue(transactions) - this.getExpenses(transactions);
  },

  getTransactionsByCategory(transactions: Transaction[]): Record<string, number> {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.status === 'completed')
      .forEach(t => {
        const category = t.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
      });
    return categoryTotals;
  },

  getTransactionsByDateRange(transactions: Transaction[], days: number = 30): Array<{ date: string; revenue: number; expenses: number }> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const dataMap = new Map<string, { revenue: number; expenses: number }>();
    
    dateRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dataMap.set(dateStr, { revenue: 0, expenses: 0 });
    });
    
    transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate && t.status === 'completed';
      })
      .forEach(t => {
        const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
        const existing = dataMap.get(dateStr) || { revenue: 0, expenses: 0 };
        
        if (t.category === 'revenue') {
          existing.revenue += t.amount;
        } else {
          existing.expenses += Math.abs(t.amount);
        }
        
        dataMap.set(dateStr, existing);
      });
    
    return Array.from(dataMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  getMonthlyTrend(transactions: Transaction[]): Array<{ month: string; revenue: number; expenses: number; profit: number }> {
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
    
    transactions
      .filter(t => t.status === 'completed')
      .forEach(t => {
        const date = new Date(t.date);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0 };
        }
        
        if (t.category === 'revenue') {
          monthlyData[monthKey].revenue += t.amount;
        } else {
          monthlyData[monthKey].expenses += Math.abs(t.amount);
        }
      });
    
    return Object.entries(monthlyData)
      .map(([month, values]) => ({
        month,
        revenue: values.revenue,
        expenses: values.expenses,
        profit: values.revenue - values.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  },

  getTaskCompletionRate(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return (completed / tasks.length) * 100;
  },

  getUpcomingDeadlines(tasks: Task[], days: number = 7): Task[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return tasks
      .filter(t => {
        const dueDate = new Date(t.dueDate);
        return t.status !== 'completed' && 
               t.status !== 'cancelled' && 
               dueDate >= now && 
               dueDate <= futureDate;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date();
    return tasks
      .filter(t => {
        const dueDate = new Date(t.dueDate);
        return t.status !== 'completed' && 
               t.status !== 'cancelled' && 
               dueDate < now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },
};


import { Transaction, Task, TransactionCategory, TaskPriority } from '../types';

export const aiService = {
  categorizeTransaction(description: string, amount: number): TransactionCategory {
    const lowerDesc = description.toLowerCase();
    
    // Revenue detection
    if (lowerDesc.includes('revenue') || lowerDesc.includes('income') || 
        lowerDesc.includes('sale') || lowerDesc.includes('payment received') ||
        amount > 0 && (lowerDesc.includes('client') || lowerDesc.includes('customer'))) {
      return 'revenue';
    }
    
    // Expense categories
    if (lowerDesc.includes('salary') || lowerDesc.includes('payroll') || 
        lowerDesc.includes('wage') || lowerDesc.includes('employee')) {
      return 'salary';
    }
    
    if (lowerDesc.includes('marketing') || lowerDesc.includes('ad') || 
        lowerDesc.includes('promotion') || lowerDesc.includes('campaign')) {
      return 'marketing';
    }
    
    if (lowerDesc.includes('software') || lowerDesc.includes('saas') || 
        lowerDesc.includes('subscription') || lowerDesc.includes('license')) {
      return 'software';
    }
    
    if (lowerDesc.includes('utility') || lowerDesc.includes('electric') || 
        lowerDesc.includes('water') || lowerDesc.includes('internet') ||
        lowerDesc.includes('phone')) {
      return 'utilities';
    }
    
    if (lowerDesc.includes('operation') || lowerDesc.includes('office') || 
        lowerDesc.includes('supply') || lowerDesc.includes('equipment')) {
      return 'operations';
    }
    
    return amount > 0 ? 'revenue' : 'expense';
  },

  detectAnomalies(transactions: Transaction[]): Transaction[] {
    if (transactions.length < 3) return [];
    
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + (2 * stdDev);
    
    return transactions.filter(t => Math.abs(t.amount) > threshold);
  },

  suggestTaskPriority(task: Task, allTasks: Task[]): TaskPriority {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Urgent if due within 1 day
    if (daysUntilDue <= 1 && task.status !== 'completed') {
      return 'urgent';
    }
    
    // High if due within 3 days
    if (daysUntilDue <= 3 && task.status !== 'completed') {
      return 'high';
    }
    
    // Medium if due within 7 days
    if (daysUntilDue <= 7 && task.status !== 'completed') {
      return 'medium';
    }
    
    // Check workload
    const activeTasks = allTasks.filter(t => 
      t.status !== 'completed' && 
      t.status !== 'cancelled' &&
      new Date(t.dueDate) <= dueDate
    ).length;
    
    if (activeTasks > 5) {
      return 'high';
    }
    
    return task.priority || 'low';
  },

  getTaskRecommendations(tasks: Task[]): Task[] {
    const now = new Date();
    const incompleteTasks = tasks
      .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      .map(t => ({
        ...t,
        priority: this.suggestTaskPriority(t, tasks),
        daysUntilDue: Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.daysUntilDue - b.daysUntilDue;
      });
    
    return incompleteTasks.slice(0, 5);
  },
};





export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type TransactionCategory = 
  | 'revenue' 
  | 'expense' 
  | 'salary' 
  | 'marketing' 
  | 'operations' 
  | 'utilities' 
  | 'software' 
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  clientId?: string;
  milestone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phoneNumber: string;
  amount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  transactions: Transaction[];
  tasks: Task[];
  clients: Client[];
  lastSync: string;
}



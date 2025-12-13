import { AppData, Transaction, Task, Client } from '../types';

const STORAGE_KEY = 'revtrak_data';

export const storage = {
  load(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Validate data structure
        if (parsed && typeof parsed === 'object') {
        return {
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          clients: Array.isArray(parsed.clients) ? parsed.clients : (Array.isArray(parsed.projects) ? [] : []),
          lastSync: parsed.lastSync || new Date().toISOString(),
        };
        }
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
    
    return {
      transactions: [],
      tasks: [],
      clients: [],
      lastSync: new Date().toISOString(),
    };
  },

  save(data: AppData): void {
    try {
      data.lastSync = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  },

  addTransaction(transaction: Transaction): void {
    const data = this.load();
    data.transactions.push(transaction);
    this.save(data);
  },

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const data = this.load();
    const index = data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      data.transactions[index] = {
        ...data.transactions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save(data);
    }
  },

  deleteTransaction(id: string): void {
    const data = this.load();
    data.transactions = data.transactions.filter(t => t.id !== id);
    this.save(data);
  },

  addTask(task: Task): void {
    const data = this.load();
    data.tasks.push(task);
    this.save(data);
  },

  updateTask(id: string, updates: Partial<Task>): void {
    const data = this.load();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      data.tasks[index] = {
        ...data.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save(data);
    }
  },

  deleteTask(id: string): void {
    const data = this.load();
    data.tasks = data.tasks.filter(t => t.id !== id);
    this.save(data);
  },

  addClient(client: Client): void {
    const data = this.load();
    data.clients.push(client);
    this.save(data);
  },

  updateClient(id: string, updates: Partial<Client>): void {
    const data = this.load();
    const index = data.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      data.clients[index] = {
        ...data.clients[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save(data);
    }
  },

  deleteClient(id: string): void {
    const data = this.load();
    data.clients = data.clients.filter(c => c.id !== id);
    this.save(data);
  },
};


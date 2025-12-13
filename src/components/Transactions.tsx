import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Download } from 'lucide-react';
import { AppData, Transaction, TransactionCategory, TransactionStatus } from '../types';
import { storage } from '../utils/storage';
import { exportService } from '../utils/export';
import { aiService } from '../utils/ai';
import TransactionModal from './modals/TransactionModal';

interface TransactionsProps {
  data: AppData;
  updateData: () => void;
}

export default function Transactions({ data, updateData }: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(data.transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAnomalies, setShowAnomalies] = useState(false);

  useEffect(() => {
    setTransactions(data.transactions);
  }, [data]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const anomalies = aiService.detectAnomalies(transactions);
  const displayedTransactions = showAnomalies ? anomalies : filteredTransactions;

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      storage.deleteTransaction(id);
      updateData();
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportService.exportToCSV({ transactions: filteredTransactions }, 'revtrak-transactions');
    } else {
      exportService.exportToPDF({ transactions: filteredTransactions }, 'revtrak-transactions');
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getCategoryColor = (category: TransactionCategory) => {
    const colors: Record<TransactionCategory, string> = {
      revenue: 'bg-green-500/20 text-green-400 border-green-500/30',
      expense: 'bg-red-500/20 text-red-400 border-red-500/30',
      salary: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      marketing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      operations: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      software: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Transactions</h2>
          <p className="text-gray-400">Manage all financial transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
          >
            <Download size={18} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors bg-glow"
          >
            <Download size={18} />
            <span className="hidden md:inline">Export PDF</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors bg-glow-green"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Add Transaction</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      {anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🔍 {anomalies.length} unusual transaction(s) detected</span>
          </div>
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
          >
            {showAnomalies ? 'Show All' : 'Show Anomalies'}
          </button>
        </motion.div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
              <option value="salary">Salary</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
              <option value="utilities">Utilities</option>
              <option value="software">Software</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Notes</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((transaction, idx) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${
                        transaction.category === 'revenue' ? 'text-accent-400' : 'text-red-400'
                      }`}>
                        {transaction.category === 'revenue' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(transaction.category)}`}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {transaction.notes.substring(0, 50)}
                        {transaction.notes.length > 50 && '...'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSave={() => {
          updateData();
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
      />
    </div>
  );
}


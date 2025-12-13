import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Download, Phone, DollarSign, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AppData, Client } from '../types';
import { storage } from '../utils/storage';
import { exportService } from '../utils/export';
import ClientModal from './modals/ClientModal';

interface ClientsProps {
  data: AppData;
  updateData: () => void;
}

export default function Clients({ data, updateData }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>(data.clients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    setClients(data.clients);
  }, [data]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.phoneNumber.includes(searchTerm) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const unpaidClients = clients.filter(c => c.paymentStatus === 'unpaid' || c.paymentStatus === 'partial');
  const overdueClients = clients.filter(c => {
    const dueDate = new Date(c.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (c.paymentStatus === 'unpaid' || c.paymentStatus === 'partial') && dueDate < today;
  });

  const totalUnpaid = unpaidClients.reduce((sum, c) => sum + c.amount, 0);
  const totalOverdue = overdueClients.reduce((sum, c) => sum + c.amount, 0);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      storage.deleteClient(id);
      updateData();
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleTogglePayment = (client: Client) => {
    const newStatus: Client['paymentStatus'] = client.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    storage.updateClient(client.id, { paymentStatus: newStatus });
    updateData();
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportService.exportToCSV({ clients: filteredClients }, 'revtrak-clients');
    } else {
      exportService.exportToPDF({ clients: filteredClients }, 'revtrak-clients');
    }
  };

  const getStatusColor = (status: Client['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unpaid': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusIcon = (status: Client['paymentStatus']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={16} />;
      case 'partial': return <AlertCircle size={16} />;
      case 'unpaid': return <XCircle size={16} />;
    }
  };

  const isOverdue = (client: Client) => {
    const dueDate = new Date(client.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (client.paymentStatus === 'unpaid' || client.paymentStatus === 'partial') && dueDate < today;
  };

  const isDueSoon = (client: Client) => {
    const dueDate = new Date(client.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue >= 0 && (client.paymentStatus === 'unpaid' || client.paymentStatus === 'partial');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Clients</h2>
          <p className="text-gray-400">Manage your clients and track payments</p>
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
            <span className="hidden md:inline">Add Client</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      {(unpaidClients.length > 0 || overdueClients.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {unpaidClients.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-400" size={20} />
                <h3 className="text-yellow-400 font-semibold">Unpaid Clients</h3>
              </div>
              <p className="text-white text-2xl font-bold">{unpaidClients.length}</p>
              <p className="text-gray-400 text-sm mt-1">${totalUnpaid.toFixed(2)} total</p>
            </div>
          )}
          {overdueClients.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="text-red-400" size={20} />
                <h3 className="text-red-400 font-semibold">Overdue Payments</h3>
              </div>
              <p className="text-white text-2xl font-bold">{overdueClients.length}</p>
              <p className="text-gray-400 text-sm mt-1">${totalOverdue.toFixed(2)} total</p>
            </div>
          )}
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-primary-400" size={20} />
              <h3 className="text-primary-400 font-semibold">Total Clients</h3>
            </div>
            <p className="text-white text-2xl font-bold">{clients.length}</p>
            <p className="text-gray-400 text-sm mt-1">All clients</p>
          </div>
        </motion.div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, phone, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Due Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, idx) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        border-b border-gray-800 hover:bg-gray-800/50 transition-colors
                        ${isOverdue(client) ? 'bg-red-500/5' : ''}
                        ${isDueSoon(client) && !isOverdue(client) ? 'bg-yellow-500/5' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{client.name}</span>
                          {isOverdue(client) && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/30">
                              Overdue
                            </span>
                          )}
                          {isDueSoon(client) && !isOverdue(client) && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30">
                              Due Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone size={14} />
                          <span>{client.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-accent-400">
                          ${client.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePayment(client)}
                          className={`
                            px-2 py-1 rounded text-xs border flex items-center gap-1 cursor-pointer transition-all
                            ${getStatusColor(client.paymentStatus)}
                            hover:opacity-80
                          `}
                        >
                          {getStatusIcon(client.paymentStatus)}
                          {client.paymentStatus}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={14} />
                          <span>{new Date(client.dueDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm max-w-xs">
                        <div className="truncate" title={client.description}>
                          {client.description || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
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

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSave={() => {
          updateData();
          setIsModalOpen(false);
          setEditingClient(null);
        }}
      />
    </div>
  );
}


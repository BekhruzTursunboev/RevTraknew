import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Download, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppData, Task, TaskPriority, TaskStatus } from '../types';
import { storage } from '../utils/storage';
import { exportService } from '../utils/export';
import { analyticsService } from '../utils/analytics';
import TaskModal from './modals/TaskModal';

interface TasksProps {
  data: AppData;
  updateData: () => void;
}

export default function Tasks({ data, updateData }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>(data.tasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(data.tasks);
  }, [data]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const overdueTasks = analyticsService.getOverdueTasks(filteredTasks);
  const upcomingTasks = analyticsService.getUpcomingDeadlines(filteredTasks, 7);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      storage.deleteTask(id);
      updateData();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    storage.updateTask(task.id, { status: newStatus });
    updateData();
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportService.exportToCSV({ tasks: filteredTasks }, 'revtrak-tasks');
    } else {
      exportService.exportToPDF({ tasks: filteredTasks }, 'revtrak-tasks');
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
      case 'in-progress': return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'todo': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const isOverdue = (task: Task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const isDueSoon = (task: Task) => {
    const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue >= 0 && task.status !== 'completed';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Tasks</h2>
          <p className="text-gray-400">Track and manage your tasks and deadlines</p>
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
            <span className="hidden md:inline">Add Task</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {overdueTasks.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-400" size={20} />
                <h3 className="text-red-400 font-semibold">Overdue Tasks</h3>
              </div>
              <p className="text-white text-2xl font-bold">{overdueTasks.length}</p>
            </div>
          )}
          {upcomingTasks.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-yellow-400" size={20} />
                <h3 className="text-yellow-400 font-semibold">Due This Week</h3>
              </div>
              <p className="text-white text-2xl font-bold">{upcomingTasks.length}</p>
            </div>
          )}
        </motion.div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found
              </div>
            ) : (
              filteredTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`
                    bg-gray-800 border rounded-lg p-4
                    ${isOverdue(task) ? 'border-red-500/50 bg-red-500/5' : ''}
                    ${isDueSoon(task) ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-700'}
                    hover:bg-gray-700/50 transition-colors
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${task.status === 'completed' 
                              ? 'bg-accent-500 border-accent-500' 
                              : 'border-gray-600 hover:border-primary-500'
                            }
                          `}
                        >
                          {task.status === 'completed' && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                        <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        {isOverdue(task) && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/30">
                            Overdue
                          </span>
                        )}
                        {isDueSoon(task) && !isOverdue(task) && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30">
                            Due Soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 ml-8">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 ml-8">
                        <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Calendar size={14} />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        {task.clientId && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                            {data.clients.find(c => c.id === task.clientId)?.name || 'Client'}
                          </span>
                        )}
                        {task.milestone && (
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs border border-primary-500/30">
                            {task.milestone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        clients={data.clients}
        onSave={() => {
          updateData();
          setIsModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}


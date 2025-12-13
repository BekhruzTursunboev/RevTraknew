import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  DollarSign, 
  CheckSquare, 
  Users,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Tasks from './components/Tasks';
import Clients from './components/Clients';
import { storage } from './utils/storage';
import { AppData } from './types';
import { analyticsService } from './utils/analytics';

function App() {
  const [data, setData] = useState<AppData>(storage.load());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedData = storage.load();
    setData(savedData);
  }, []);

  const updateData = () => {
    setData(storage.load());
  };

  const overdueTasks = analyticsService.getOverdueTasks(data.tasks);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} overdueCount={overdueTasks.length} />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-4 md:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard data={data} updateData={updateData} />} />
                <Route path="/transactions" element={<Transactions data={data} updateData={updateData} />} />
                <Route path="/tasks" element={<Tasks data={data} updateData={updateData} />} />
                <Route path="/clients" element={<Clients data={data} updateData={updateData} />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
}

function Navbar({ sidebarOpen, setSidebarOpen, overdueCount }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void; overdueCount: number }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: DollarSign, label: 'Transactions' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/clients', icon: Users, label: 'Clients' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RevTrak" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-glow">RevTrak</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-primary-600 text-white bg-glow'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {overdueCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30"
              >
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{overdueCount} Overdue</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: DollarSign, label: 'Transactions' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/clients', icon: Users, label: 'Clients' },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 border-r border-gray-800
          transition-transform duration-300 ease-in-out
          md:!translate-x-0
        `}
      >
        <div className="p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary-600 text-white bg-glow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}

export default App;


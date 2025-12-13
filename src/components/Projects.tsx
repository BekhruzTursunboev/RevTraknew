import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Download, Calendar, CheckCircle2, Clock, Pause } from 'lucide-react';
import { AppData, Project } from '../types';
import { storage } from '../utils/storage';
import { exportService } from '../utils/export';
import ProjectModal from './modals/ProjectModal';

interface ProjectsProps {
  data: AppData;
  updateData: () => void;
}

export default function Projects({ data, updateData }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>(data.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(data.projects);
  }, [data]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project? All associated tasks will be unlinked.')) {
      storage.deleteProject(id);
      updateData();
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportService.exportToCSV({ projects: filteredProjects }, 'revtrak-projects');
    } else {
      exportService.exportToPDF({ projects: filteredProjects }, 'revtrak-projects');
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-accent-500/20 text-accent-400 border-accent-500/30';
      case 'completed': return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Clock size={16} />;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'on-hold': return <Pause size={16} />;
    }
  };

  const getProjectProgress = (project: Project) => {
    const projectTasks = data.tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    return (completed / projectTasks.length) * 100;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Projects</h2>
          <p className="text-gray-400">Manage your projects and milestones</p>
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
            <span className="hidden md:inline">Add Project</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No projects found
              </div>
            ) : (
              filteredProjects.map((project, idx) => {
                const progress = getProjectProgress(project);
                const projectTasks = data.tasks.filter(t => t.projectId === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:bg-gray-700/50 hover:border-primary-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 overflow-hidden text-ellipsis line-clamp-2">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{completedTasks} / {projectTasks.length} tasks</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-accent-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {project.milestones.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Milestones:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.milestones.slice(0, 3).map((milestone, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs border border-primary-500/30"
                              >
                                {milestone}
                              </span>
                            ))}
                            {project.milestones.length > 3 && (
                              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                +{project.milestones.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={() => {
          updateData();
          setIsModalOpen(false);
          setEditingProject(null);
        }}
      />
    </div>
  );
}


// frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import toast, { Toaster } from 'react-hot-toast';

// Layout components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages / Business components (imports directs)
import Dashboard from './components/pages/Dashboard';
import Statistics from './components/pages/Statistics';
import Courses from './components/pages/Courses';
import Schedules from './components/pages/Schedules';
import Import from './components/pages/Import';
import Reports from './components/pages/Reports';
import Teachers from './components/pages/Teachers';
import Export from './components/pages/Export';

// API
import api from './config/api';

// Hooks
import { useExcelExport } from './hooks/useExcelExport';

function AppContent() {
  // États principaux
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { exportTeachersToExcel, exportStatsToExcel, exportComprehensiveReport } = useExcelExport();

  // Charger les données initiales
  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersRes, coursesRes] = await Promise.all([
        api.get('/enseignants'),
        api.get('/cours').catch(() => ({ data: [] })),
      ]);
      setTeachers(teachersRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data helpers
  const refreshTeachers = async () => {
    try {
      const res = await api.get('/enseignants');
      setTeachers(res.data);
      toast.success('Données enseignants actualisées');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'actualisation des enseignants');
    }
  };

  const refreshCourses = async () => {
    try {
      const res = await api.get('/cours');
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshTeachers(), refreshCourses()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Statistiques calculées pour Sidebar et Dashboard
  const stats = useMemo(() => ({
    totalTeachers: teachers.length,
    totalCourses: teachers.reduce((sum, t) => sum + (t.cours?.length || 0), 0),
    totalHeuresNormales: teachers.reduce((sum, t) => sum + (t.heuresNormales || 0), 0),
    totalHeuresSuppl: teachers.reduce((sum, t) => sum + (t.heuresSupplementaires || 0), 0),
    teachersWithOvertime: teachers.filter(t => (t.heuresSupplementaires || 0) > 0).length
  }), [teachers]);

  // Export helpers
  const handleQuickExport = async (type) => {
    try {
      let result;
      switch (type) {
        case 'teachers': result = exportTeachersToExcel(teachers); break;
        case 'stats': result = exportStatsToExcel(teachers); break;
        case 'comprehensive': result = exportComprehensiveReport(teachers, courses); break;
        default: return;
      }
      if (result.success) toast.success(`Export réussi: ${result.filename}`);
      else toast.error(`Erreur export: ${result.error}`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'exportation');
    }
  };

  // Notifications helper
  const notify = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg),
    warning: (msg) => toast(msg, { icon: '⚠️' })
  };

  // Gestion responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const commonProps = { teachers, courses, refreshTeachers, refreshCourses, refreshAll, notify, loading };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard {...commonProps} stats={stats} onQuickExport={handleQuickExport} />;
      case 'stats': return <Statistics {...commonProps} stats={stats} />;
      case 'teachers': return <Teachers {...commonProps} />;
      case 'courses': return <Courses {...commonProps} />;
      case 'schedules': return <Schedules {...commonProps} />;
      case 'import': return <Import {...commonProps} />;
      case 'export': return <Export {...commonProps} onExport={handleQuickExport} />;
      case 'reports': return <Reports {...commonProps} />;
      default: return <Dashboard {...commonProps} stats={stats} onQuickExport={handleQuickExport} />;
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-primary mb-2">Chargement de l'application...</h2>
          <p className="text-secondary">Connexion au serveur et récupération des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' },
        success: { iconTheme: { primary: 'var(--success-500)', secondary: 'white' } },
        error: { iconTheme: { primary: 'var(--error-500)', secondary: 'white' } },
      }} />

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        stats={stats}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          activeSection={activeSection}
          setIsMobileOpen={setIsMobileOpen}
          isMobileOpen={isMobileOpen}
          user={{ name: 'Administrateur ILC', role: 'Admin' }}
        />

        <main className="content-area">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

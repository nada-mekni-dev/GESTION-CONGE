import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import LeaveRequestsList from '@/components/LeaveRequestsList';
import ProfileEdit from '@/components/EditProfil';
import Employee from '@/components/ListAddEmp';

const Index = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-request':
        return <LeaveRequestForm />;
      case 'requests':
        return <LeaveRequestsList />;
      case 'profile_edit':
        return <ProfileEdit />;
      case 'list_add_emp':
        return <Employee />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <div className="animate-fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default Index;

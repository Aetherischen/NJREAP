
import { useLocation } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardOverview from '@/components/admin/DashboardOverview';
import JobsManagement from '@/components/admin/JobsManagement';
import ListingsManagement from '@/components/admin/ListingsManagement';
import BlogManagement from '@/components/admin/BlogManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/admin':
      case '/admin/dashboard':
        return <DashboardOverview />;
      case '/admin/jobs':
        return <JobsManagement />;
      case '/admin/listings':
        return <ListingsManagement />;
      case '/admin/blog':
        return <BlogManagement />;
      case '/admin/gallery':
        return <GalleryManagement />;
      case '/admin/analytics':
        return <AnalyticsDashboard />;
      case '/admin/settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;

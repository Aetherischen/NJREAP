import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  User,
  BookOpen,
  Camera,
  FileText,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import NotificationsPanel from "./NotificationsPanel";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user, profile, loading, signOut, checkAdminRole } = useAuth();

  // Hide all admin pages from search engines
  useSEO({
    title: 'Management Portal',
    description: 'Internal management system',
    noindex: true
  });

  useEffect(() => {
    console.log('AdminLayout effect - loading:', loading, 'user:', user?.email, 'isAdmin:', checkAdminRole(), 'path:', location.pathname);
    
    // Only handle redirects if we're actually on admin routes
    if (!location.pathname.startsWith('/admin')) {
      console.log('AdminLayout: Not on admin route, skipping auth checks');
      return;
    }

    // Only redirect if we're done loading and have determined auth status
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }
      
      if (!checkAdminRole()) {
        console.log('User is not admin, redirecting to access denied');
        navigate('/access-denied');
        return;
      }
      
      console.log('User is authenticated admin, staying on admin page');
    }
  }, [user, loading, checkAdminRole, navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      console.log('Handling logout...');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const navItems = [
    {
      name: "Overview",
      path: "/admin",
      icon: LayoutDashboard,
      description: "System Overview",
    },
    {
      name: "Projects",
      path: "/admin/jobs",
      icon: Briefcase,
      description: "Project Management",
    },
    {
      name: "Content",
      path: "/admin/blog",
      icon: BookOpen,
      description: "Content Management",
    },
    {
      name: "Media",
      path: "/admin/gallery",
      icon: Camera,
      description: "Media Management",
    },
    {
      name: "Metrics",
      path: "/admin/analytics",
      icon: BarChart3,
      description: "Performance Metrics",
    },
    {
      name: "Config",
      path: "/admin/settings",
      icon: Settings,
      description: "System Configuration",
    },
  ];

  // Show loading spinner while auth is being determined
  if (loading) {
    console.log('Showing loading state...');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d0a97] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated or not admin AND we're on admin routes
  if (location.pathname.startsWith('/admin') && (!user || !checkAdminRole())) {
    console.log('User not authorized for admin routes, rendering null while redirect happens');
    return null;
  }

  console.log('Rendering admin layout for authenticated admin user');

  const getCurrentPageInfo = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem || { name: "Portal", description: "Management System" };
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">MP</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {profile?.role || 'admin'}
            </Badge>
            <span className="text-xs text-gray-500">
              Online
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${isActive ? "text-white" : "text-gray-900"}`}
                  >
                    {item.name}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 bg-gray-900 rounded mr-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span>View Website</span>
          </Link>
          <Button
            onClick={() => setShowLogoutDialog(true)}
            variant="ghost"
            className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Portal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentPageInfo.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPageInfo.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative"
                  onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
                <NotificationsPanel 
                  isOpen={notificationsPanelOpen}
                  onClose={() => setNotificationsPanelOpen(false)}
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit the management portal? You will need to authenticate again to access these features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Exit Portal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLayout;

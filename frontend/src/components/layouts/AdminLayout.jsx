import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNav from '../admin/AdminNav';
import { useUser } from '../../context/UserContext';

export default function AdminLayout({ children }) {

  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    }
  }, [user, loading, navigate, location]);

  return (
    <div className="min-h-screen">
      {/* Fixed Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold tracking-tight">Admin Panel</h2>
        </div>
        <div className="p-2">
          <AdminNav />
        </div>
      </aside>

      {/* Main Content with left offset */}
      <main className="ml-64 min-h-screen bg-gray-50">
        <div className="p-6 sm:p-8 pt-10 sm:pt-12">{children}</div>
      </main>
    </div>
  );
}
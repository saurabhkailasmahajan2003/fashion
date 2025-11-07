import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getUsers } from '../../api/userAPI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getUsers();
        setUsers(Array.isArray(res) ? res : []);
      } catch (e) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter(u => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u._id).toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name, email, or ID"
              className="px-3 py-2 border rounded-md w-64 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-red-600">{error}</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No users found</td></tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u._id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{u.name || '—'}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${u.isAdmin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

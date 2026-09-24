import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/users')
      .then(({ data }) => {
        if (!cancelled) setUsers(data.users);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load users.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) return <p className="text-sm text-ink-soft">Loading users…</p>;
  if (error) return <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>;

  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {users.map((u) => (
        <li key={u.id} className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{u.name}</p>
            <p className="truncate text-sm text-ink-soft">{u.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
              {u.role}
            </span>
            {u.id !== currentUser.id && (
              <button
                onClick={() => handleDelete(u.id)}
                className="text-xs font-medium text-danger hover:underline cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

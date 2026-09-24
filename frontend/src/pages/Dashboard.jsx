import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskRow from '../components/TaskRow';
import AdminUsers from '../components/AdminUsers';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tab, setTab] = useState('tasks'); // tasks | users
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | completed

  const loadTasks = async () => {
    setError('');
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (payload) => {
    const { data } = await api.post('/tasks', payload);
    setTasks((prev) => [data.task, ...prev]);
  };

  const handleUpdate = async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
  };

  const handleToggleStatus = (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    return handleUpdate(task.id, { status: nextStatus });
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const visibleTasks = tasks.filter((t) => filter === 'all' || t.status === filter);
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-line bg-surface px-4 py-3">
        <p className="text-sm">
          Signed in as <span className="font-medium">{user?.name}</span> ({user?.email})
        </p>
      </div>

      {isAdmin && (
        <div className="mt-6 flex gap-1 text-sm">
          {[
            { key: 'tasks', label: 'All tasks' },
            { key: 'users', label: 'All users' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                'rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ' +
                (tab === t.key ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink')
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {(!isAdmin || tab === 'tasks') && (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isAdmin ? 'All tasks' : 'Your tasks'}
            </h1>
            {!loading && (
              <p className="text-sm text-ink-soft">
                {pendingCount} pending · {tasks.length} total
              </p>
            )}
          </div>

          <div className="mt-6">
            <TaskForm onCreate={handleCreate} />
          </div>

          <div className="mt-6 flex gap-1 text-sm">
            {['all', 'pending', 'completed'].map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  'rounded-md px-3 py-1.5 capitalize transition-colors cursor-pointer ' +
                  (filter === key ? 'bg-surface font-medium text-ink' : 'text-ink-soft hover:text-ink')
                }
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {loading && <p className="py-8 text-center text-sm text-ink-soft">Loading tasks…</p>}

            {!loading && error && (
              <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
            )}

            {!loading && !error && visibleTasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-line py-10 text-center">
                <p className="text-sm text-ink-soft">
                  {tasks.length === 0
                    ? 'No tasks yet. Add your first one above.'
                    : 'Nothing here for this filter.'}
                </p>
              </div>
            )}

            {!loading && !error && visibleTasks.length > 0 && (
              <ul>
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    showOwner={isAdmin}
                    onToggleStatus={handleToggleStatus}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {isAdmin && tab === 'users' && (
        <section className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">All users</h1>
          <div className="mt-6">
            <AdminUsers />
          </div>
        </section>
      )}
    </div>
  );
}

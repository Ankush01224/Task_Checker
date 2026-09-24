import { useState } from 'react';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the task a title first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() || undefined });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="whitespace-nowrap rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Adding…' : 'Add task'}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}

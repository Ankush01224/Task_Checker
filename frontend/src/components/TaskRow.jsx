import { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function TaskRow({ task, onToggleStatus, onUpdate, onDelete, showOwner }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [busy, setBusy] = useState(false);

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onUpdate(task.id, { title: title.trim(), description: description.trim() });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(task.id);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="flex flex-col gap-2 border-b border-line py-4 last:border-b-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-line px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="rounded-md border border-line px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            disabled={busy}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <StatusBadge status={task.status} />
          {showOwner && (
            <span className="text-xs text-ink-soft">user #{task.userId}</span>
          )}
        </div>
        {task.description && <p className="mt-1 text-sm text-ink-soft">{task.description}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs">
        <button
          onClick={() => onToggleStatus(task)}
          disabled={busy}
          className="font-medium text-accent hover:underline cursor-pointer disabled:opacity-60"
        >
          Mark {task.status === 'completed' ? 'pending' : 'done'}
        </button>
        <button onClick={startEdit} className="text-ink-soft hover:text-ink cursor-pointer">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-danger hover:underline cursor-pointer disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

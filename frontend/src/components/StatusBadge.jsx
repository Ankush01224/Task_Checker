export default function StatusBadge({ status }) {
  const isDone = status === 'completed';
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
        (isDone ? 'bg-success-bg text-success' : 'bg-surface text-ink-soft')
      }
    >
      {isDone ? 'Completed' : 'Pending'}
    </span>
  );
}

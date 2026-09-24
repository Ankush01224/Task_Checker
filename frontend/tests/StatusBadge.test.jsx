import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatusBadge from '../src/components/StatusBadge';

describe('StatusBadge', () => {
  test('shows "Completed" for a completed task', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('shows "Pending" for a pending task', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

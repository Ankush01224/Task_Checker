import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import TaskForm from '../src/components/TaskForm';

describe('TaskForm', () => {
  test('shows a validation message and does not submit when the title is empty', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(await screen.findByText(/give the task a title/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  test('calls onCreate with the entered title and description, then clears the form', async () => {
    const onCreate = vi.fn().mockResolvedValue();
    const user = userEvent.setup();
    render(<TaskForm onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText(/task title/i), 'Write README');
    await user.type(screen.getByPlaceholderText(/description/i), 'Document setup steps');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({ title: 'Write README', description: 'Document setup steps' });
    });
    expect(screen.getByPlaceholderText(/task title/i)).toHaveValue('');
  });
});

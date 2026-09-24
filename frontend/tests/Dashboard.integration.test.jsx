import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../src/pages/Dashboard';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/api/client';

vi.mock('../src/api/client');

function renderDashboard() {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Ankush', email: 'ankush@test.com', role: 'user' }));

  return render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Dashboard integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('loads and displays tasks from the API', async () => {
    api.get.mockResolvedValueOnce({
      data: { tasks: [{ id: 1, title: 'Write tests', description: '', status: 'pending', userId: 1 }] },
    });

    renderDashboard();

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    expect(await screen.findByText('Write tests')).toBeInTheDocument();
  });

  test('shows an empty state when there are no tasks yet', async () => {
    api.get.mockResolvedValueOnce({ data: { tasks: [] } });
    renderDashboard();

    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
  });

  test('creating a task calls the API and adds it to the visible list', async () => {
    api.get.mockResolvedValueOnce({ data: { tasks: [] } });
    api.post.mockResolvedValueOnce({
      data: { task: { id: 2, title: 'Ship feature', description: '', status: 'pending', userId: 1 } },
    });

    const user = userEvent.setup();
    renderDashboard();

    await screen.findByText(/no tasks yet/i);

    await user.type(screen.getByPlaceholderText(/task title/i), 'Ship feature');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/tasks', { title: 'Ship feature', description: undefined });
    });
    expect(await screen.findByText('Ship feature')).toBeInTheDocument();
  });

  test('surfaces an API error instead of silently failing', async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: 'Could not load tasks.' } } });
    renderDashboard();

    expect(await screen.findByText('Could not load tasks.')).toBeInTheDocument();
  });
});

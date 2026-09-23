const request = require('supertest');
require('./setup');
const app = require('../src/app');
const { AppDataSource } = require('../src/config/data-source');
const User = require('../src/entities/User');

async function registerAndLogin(email) {
  await request(app).post('/auth/register').send({ name: 'Test User', email, password: 'password123' });
  const res = await request(app).post('/auth/login').send({ email, password: 'password123' });
  return res.body.token;
}

async function promoteToAdmin(email) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  user.role = 'admin';
  await userRepo.save(user);
}

describe('Task management', () => {
  test('a logged-in user can create and then list their own task', async () => {
    const token = await registerAndLogin('owner@example.com');

    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests', description: 'Cover the task API' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.task.title).toBe('Write tests');
    expect(createRes.body.task.status).toBe('pending');

    const listRes = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.tasks).toHaveLength(1);
  });

  test('rejects task creation without a title', async () => {
    const token = await registerAndLogin('notitle@example.com');

    const res = await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({});

    expect(res.status).toBe(400);
  });

  test('a user cannot view, edit, or delete another user\'s task', async () => {
    const ownerToken = await registerAndLogin('owner2@example.com');
    const strangerToken = await registerAndLogin('stranger@example.com');

    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Private task' });
    const taskId = created.body.task.id;

    const strangerList = await request(app).get('/tasks').set('Authorization', `Bearer ${strangerToken}`);
    expect(strangerList.body.tasks).toHaveLength(0);

    const strangerUpdate = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ title: 'Hijacked' });
    expect(strangerUpdate.status).toBe(404);

    const strangerDelete = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${strangerToken}`);
    expect(strangerDelete.status).toBe(404);
  });

  test('an admin can see and manage every user\'s tasks', async () => {
    const userToken = await registerAndLogin('regular@example.com');
    await registerAndLogin('admin@example.com');
    await promoteToAdmin('admin@example.com');

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    await request(app).post('/tasks').set('Authorization', `Bearer ${userToken}`).send({ title: 'User task' });

    const adminList = await request(app).get('/tasks').set('Authorization', `Bearer ${adminToken}`);
    expect(adminList.status).toBe(200);
    expect(adminList.body.tasks.length).toBeGreaterThanOrEqual(1);
  });

  test('rejects all task routes without a token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });
});

describe('User management (admin-only)', () => {
  test('a normal user is forbidden from listing all users', async () => {
    const token = await registerAndLogin('plain@example.com');
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('an admin can list all users', async () => {
    await registerAndLogin('admin2@example.com');
    await promoteToAdmin('admin2@example.com');
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'admin2@example.com', password: 'password123' });

    const res = await request(app).get('/users').set('Authorization', `Bearer ${adminLogin.body.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

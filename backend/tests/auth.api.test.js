const request = require('supertest');
require('./setup');
const app = require('../src/app');

describe('POST /auth/register', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Ankush',
      email: 'ankush@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('ankush@example.com');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined(); // never leak the hash
  });

  test('rejects a duplicate email', async () => {
    await request(app).post('/auth/register').send({
      name: 'Ankush',
      email: 'dup@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/auth/register').send({
      name: 'Someone Else',
      email: 'dup@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  test('rejects a weak/missing password with 400', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Ankush',
      email: 'weak@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'password123',
    });
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects an incorrect password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });
});

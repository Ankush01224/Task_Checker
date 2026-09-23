process.env.JWT_SECRET = 'test_secret';
const { signToken, verifyToken } = require('../src/utils/jwt');

describe('jwt utils', () => {
  const fakeUser = { id: 1, email: 'a@b.com', role: 'user' };

  test('signToken produces a token that verifyToken can decode', () => {
    const token = signToken(fakeUser);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(fakeUser.id);
    expect(decoded.email).toBe(fakeUser.email);
    expect(decoded.role).toBe(fakeUser.role);
  });

  test('verifyToken throws on a tampered token', () => {
    const token = signToken(fakeUser);
    const tampered = token.slice(0, -2) + 'xx';

    expect(() => verifyToken(tampered)).toThrow();
  });

  test('verifyToken throws on garbage input', () => {
    expect(() => verifyToken('not.a.real.token')).toThrow();
  });
});

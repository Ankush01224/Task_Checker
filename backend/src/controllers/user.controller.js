const { AppDataSource } = require('../config/data-source');
const User = require('../entities/User');

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

// GET /users/me — any authenticated user can see their own profile
async function getMe(req, res, next) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

// GET /users — admin only
async function getAllUsers(req, res, next) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    return res.status(200).json({ users: users.map(toPublicUser) });
  } catch (err) {
    return next(err);
  }
}

// DELETE /users/:id — admin only
async function deleteUser(req, res, next) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const id = Number(req.params.id);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await userRepo.remove(user);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe, getAllUsers, deleteUser };

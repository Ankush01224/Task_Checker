const { Router } = require('express');
const { getMe, getAllUsers, deleteUser } = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.get('/', requireRole('admin'), getAllUsers);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;

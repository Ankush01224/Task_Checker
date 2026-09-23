const { Router } = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/task.controller');
const { requireAuth } = require('../middleware/auth');
const { runValidation } = require('../middleware/validate');

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  runValidation([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  ]),
  createTask
);

router.get('/', getTasks);

router.put(
  '/:id',
  runValidation([
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  ]),
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;

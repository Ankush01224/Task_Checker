const { AppDataSource } = require('../config/data-source');
const Task = require('../entities/Task');

function toPublicTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    userId: task.owner ? task.owner.id : task.userId,
  };
}

// POST /tasks
async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;
    const taskRepo = AppDataSource.getRepository(Task);

    const task = taskRepo.create({
      title,
      description: description || null,
      status: status || 'pending',
      owner: { id: req.user.id },
    });

    await taskRepo.save(task);
    return res.status(201).json({ task: toPublicTask(task) });
  } catch (err) {
    return next(err);
  }
}

// GET /tasks — admin sees everything, a normal user sees only their own
async function getTasks(req, res, next) {
  try {
    const taskRepo = AppDataSource.getRepository(Task);

    const where = req.user.role === 'admin' ? {} : { owner: { id: req.user.id } };
    const tasks = await taskRepo.find({ where, relations: { owner: true }, order: { createdAt: 'DESC' } });

    return res.status(200).json({ tasks: tasks.map(toPublicTask) });
  } catch (err) {
    return next(err);
  }
}

async function findAccessibleTask(req) {
  const taskRepo = AppDataSource.getRepository(Task);
  const id = Number(req.params.id);
  const task = await taskRepo.findOne({ where: { id }, relations: { owner: true } });

  if (!task) return { task: null, taskRepo };
  if (req.user.role !== 'admin' && task.owner.id !== req.user.id) {
    return { task: undefined, taskRepo }; // exists, but not this user's — treated as not found
  }
  return { task, taskRepo };
}

// PUT /tasks/:id
async function updateTask(req, res, next) {
  try {
    const { task, taskRepo } = await findAccessibleTask(req);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await taskRepo.save(task);
    return res.status(200).json({ task: toPublicTask(task) });
  } catch (err) {
    return next(err);
  }
}

// DELETE /tasks/:id
async function deleteTask(req, res, next) {
  try {
    const { task, taskRepo } = await findAccessibleTask(req);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await taskRepo.remove(task);
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };

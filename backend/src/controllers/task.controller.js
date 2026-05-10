const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTask = async (req, res) => {
  const { title, description, projectId, assignedToId, dueDate } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title, description, projectId,
        assignedToId, dueDate: dueDate ? new Date(dueDate) : null,
        createdById: req.user.id
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId: parseInt(projectId) } : { assignedToId: req.user.id },
      include: { assignedTo: true, createdBy: true }
    });
    const now = new Date();
    const updated = tasks.map(t => ({
      ...t,
      status: t.dueDate && t.dueDate < now && t.status !== 'DONE' ? 'OVERDUE' : t.status
    }));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
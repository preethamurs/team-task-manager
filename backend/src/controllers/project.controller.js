const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name, description,
        members: { create: { userId: req.user.id, role: 'ADMIN' } }
      }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: { members: { include: { user: true } }, tasks: true }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMember = async (req, res) => {
  const { projectId, userId, role } = req.body;
  try {
    const member = await prisma.projectMember.create({
      data: { projectId, userId, role: role || 'MEMBER' }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
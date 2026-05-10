const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/task.controller');
router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/:id/status', auth, updateTaskStatus);
router.delete('/:id', auth, deleteTask);
module.exports = router;
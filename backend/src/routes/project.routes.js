const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { createProject, getProjects, addMember } = require('../controllers/project.controller');
router.get('/', auth, getProjects);
router.post('/', auth, createProject);
router.post('/member', auth, addMember);
module.exports = router;
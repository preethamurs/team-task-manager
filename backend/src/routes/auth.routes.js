const router = require('express').Router();
const { register, login, getUsers } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', auth, getUsers);

module.exports = router;
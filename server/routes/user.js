const express = require('express');

const userController = require('../controllers/user');
// const expenseController = require('../controllers/expense');

const router = express.Router();

const userAuthentication = require('../middlewares/auth')



router.post('/signup', userController.postCreateUser);

router.post('/login', userController.postLoginUser)

// router.get('/download', userAuthentication.authenticate, expenseController.downloadExpenses)

// router.get('/details', userController)

router.get('/online', userController.getOnlineUsers);
router.get('/logout', userAuthentication.authenticate, userController.getLogoutUser);
router.get('/findUser', userController.getFindUsers);


module.exports = router;

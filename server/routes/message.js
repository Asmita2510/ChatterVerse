const express = require('express');

// const userController = require('../controllers/user');
const messageController = require('../controllers/message');
// const expenseController = require('../controllers/expense');

const router = express.Router();

const userAuthentication = require('../middlewares/auth')

const multerMiddleware = require('../middlewares/multer')
const upload = multerMiddleware.multer.single('image');

router.post('/add-message', userAuthentication.authenticate, messageController.postAddMessage);

router.get('/get-messages', messageController.getMessages);

router.post('/add-media', userAuthentication.authenticate, upload, messageController.postAddImage);


module.exports = router;

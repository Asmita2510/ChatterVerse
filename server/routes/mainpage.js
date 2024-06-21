const express = require('express');

// const userController = require('../controllers/user');
const mainPageController = require('../controllers/mainpage');
// const expenseController = require('../controllers/expense');

const router = express.Router();




router.get('/:url', mainPageController.getHomePage);

// router.get('',  mainPageController.getMessages);


module.exports = router;
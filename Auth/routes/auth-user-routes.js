const express = require('express');
const authController = require('../Controllers/authController');


const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/verifyOtp', authController.verifyOtp);
router.get('/logout', authController.logout);

router.patch('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/updatePhone', authController.updatePhone);

// Protect all routes after this middleware
//router.use(authController.protect);

//router.patch('/updateMyPassword', authController.updatePassword);
/*
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));


router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
*/

module.exports = router;

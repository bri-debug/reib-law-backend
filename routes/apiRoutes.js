const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
const axios = require('axios');
const multer = require('multer');

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const AuthenticationMiddlewares = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../helpers/commonFunctions');

/* ############################################ Joi Validation Schema ################################## */
const authenticationSchema = require('../validation-schema/User/AuthValidationSchema');
const workRequestValidationSchema = require('../validation-schema/User/WorkRequestValidationSchema');

/* ############################################ Controllers ############################################ */
const authController = require('../controllers/User/AuthController');
const workRequestController = require('../controllers/User/WorkRequestController');

/* ############################################ Authentication ############################################ */
router.post('/registration', validateRequest.validate(authenticationSchema.signupSchema, 'body'), authController.newUserCreate); //User Registration
router.post('/login', validateRequest.validate(authenticationSchema.signinSchema, 'body'), authController.userLogin); //User Login
router.put('/forget_password', validateRequest.validate(authenticationSchema.forgetPasswordSchema, 'body'), authController.forgetPassword); //Forget Password
router.put('/reset_password', validateRequest.validate(authenticationSchema.resetPasswordSchema, 'body'), authController.resetPassword); //Reset Password

/* ############################################ Work Request ############################################ */
router.post('/create_new_work_request', AuthenticationMiddlewares.authenticateRequestAPI, validateRequest.validate(workRequestValidationSchema.workRequestCreateSchema, 'body'), workRequestController.createNewWorkRequest); //Create New Work Request
router.get('/progress_work_request_list', AuthenticationMiddlewares.authenticateRequestAPI, validateRequest.validate(workRequestValidationSchema.activeWorkRequestListSchema, 'query'), workRequestController.inProgressWorkRequestList); //Fetch Active New Work Request List
router.get('/completed_work_request_list', AuthenticationMiddlewares.authenticateRequestAPI, validateRequest.validate(workRequestValidationSchema.completedWorkRequestListSchema, 'query'), workRequestController.completedWorkRequestList); //Fetch Completed New Work Request List
router.get('/work_request_details', AuthenticationMiddlewares.authenticateRequestAPI, validateRequest.validate(workRequestValidationSchema.workRequestDetailsSchema, 'query'), workRequestController.workRequestDetails); //Fetch Work Request Details

module.exports = router;

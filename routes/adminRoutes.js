const express = require('express');
const router = express.Router();

/* ############################################ Middlewares ############################################ */
const validateRequest = require('../middlewares/ValidateRequest');
const AuthenticationMiddlewares = require('../middlewares/AuthenticationMiddleware');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../helpers/commonFunctions');

/* ############################################ Joi Validation Schema ################################## */
const authValidationSchema = require('../validation-schema/Admin/AuthValidationSchema');
const workRequestValidationSchema = require('../validation-schema/Admin/WorkRequestValidationSchema');

/* ############################################ Controllers ############################################ */
const authController = require('../controllers/Admin/AuthController');
const workRequestController = require('../controllers/Admin/WorkRequestController');
const clientController = require('../controllers/Admin/ClientController');

/* ############################################ Authentication ############################################ */
router.post('/admin_registration', validateRequest.validate(authValidationSchema.signupSchema, 'body'), authController.newAdminCreate); //Admin Registration
router.post('/admin_login', validateRequest.validate(authValidationSchema.signinSchema, 'body'), authController.adminLogin); //Admin Login
router.put('/admin_forget_password', validateRequest.validate(authValidationSchema.forgetPasswordSchema, 'body'), authController.forgetPassword); //Forget Password
router.put('/admin_reset_password', validateRequest.validate(authValidationSchema.resetPasswordSchema, 'body'), authController.resetPassword); //Reset Password
router.get('/profile', AuthenticationMiddlewares.authenticateAdminRequestAPI, authController.getProfile); //Admin Profile
router.put('/profile', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(authValidationSchema.profileUpdateSchema, 'body'), authController.updateProfile); //Update Admin Profile
router.get('/clients', AuthenticationMiddlewares.authenticateAdminRequestAPI, clientController.clientList); //Fetch Clients
router.get('/client_details', AuthenticationMiddlewares.authenticateAdminRequestAPI, clientController.clientDetails); //Fetch Client Details
// router.get('/team_members', AuthenticationMiddlewares.authenticateAdminRequestAPI, authController.listTeamMembers); //Fetch Team Members

/* ############################################ Work Request ############################################ */
router.get('/progress_work_request_list', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(workRequestValidationSchema.activeWorkRequestListSchema, 'query'), workRequestController.inProgressWorkRequestList); //Fetch Active New Work Request List
router.get('/completed_work_request_list', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(workRequestValidationSchema.completedWorkRequestListSchema, 'query'), workRequestController.completedWorkRequestList); //Fetch Completed New Work Request List
router.get('/work_request_details', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(workRequestValidationSchema.workRequestDetailsSchema, 'query'), workRequestController.workRequestDetails); //Fetch Work Request Details
router.put('/assign_work_request', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(workRequestValidationSchema.workRequestAssignSchema, 'body'), workRequestController.assignWorkRequest); //Work Request Assign


module.exports = router;
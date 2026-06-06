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
const planValidationSchema = require('../validation-schema/Admin/PlanValidationSchema');
const supportValidationSchema = require('../validation-schema/Admin/SupportValidationSchema');

/* ############################################ Controllers ############################################ */
const authController = require('../controllers/Admin/AuthController');
const workRequestController = require('../controllers/Admin/WorkRequestController');
const clientController = require('../controllers/Admin/ClientController');
const resourceCenterController = require('../controllers/Admin/ResourceCenterController');
const planController = require('../controllers/Admin/PlanController');
const supportController = require('../controllers/Admin/SupportController');
const adminController = require('../controllers/Admin/AdminController');

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
router.post('/create_new_work_request', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(workRequestValidationSchema.workRequestCreateSchema, 'body'), workRequestController.createNewWorkRequest); //Create New Work Request
router.post('/upload_work_doc', AuthenticationMiddlewares.authenticateAdminRequestAPI, commonFunctions.uploadMultiple, workRequestController.uploadDoc); //Upload Work Document

/* ############################################ Resource Senter ############################################ */
router.post('/upload_template_doc', AuthenticationMiddlewares.authenticateAdminRequestAPI, commonFunctions.uploadMultiple, resourceCenterController.uploadTemplateDoc); //Upload Template Document

/* ############################################ Plan ############################################ */
router.post('/plan_create', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(planValidationSchema.planCreateSchema, 'body'), planController.newPlanCreate); //Create New Plan
router.get('/fetch_plan_list', AuthenticationMiddlewares.authenticateAdminRequestAPI, planController.planList); //Fetch Plan List
router.put('/plan_update', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(planValidationSchema.planUpdateSchema, 'body'), planController.newPlanUpdate); //Update Plan
router.put('/plan_delete', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(planValidationSchema.planDeleteSchema, 'body'), planController.planDelete); //Delete Plan

/* ############################################ Support ############################################ */
router.get('/support_conversations', AuthenticationMiddlewares.authenticateAdminRequestAPI, supportController.supportConversationList); //Fetch Support Conversation List
router.get('/support_messages', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(supportValidationSchema.supportThreadSchema, 'query'), supportController.supportMessages); //Fetch Support Messages
router.post('/support_messages', AuthenticationMiddlewares.authenticateAdminRequestAPI, validateRequest.validate(supportValidationSchema.sendSupportMessageSchema, 'body'), supportController.sendSupportMessage); //Send Support Message

/* ############################################ Plan ############################################ */
router.get('/fetch_admin_list', AuthenticationMiddlewares.authenticateAdminRequestAPI, adminController.adminList); //Fetch Admin List

module.exports = router;

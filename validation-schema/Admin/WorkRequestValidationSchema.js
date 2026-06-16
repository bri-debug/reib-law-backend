const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// active work request list validation schema
module.exports.activeWorkRequestListSchema = Joi.object().keys({
    search: Joi.string().allow('', null),
    status: Joi.string().allow('', null),
    lastID: Joi.string().allow('', null),
});

// completed work request list validation schema
module.exports.completedWorkRequestListSchema = Joi.object().keys({
    search: Joi.string().allow('', null),
    status: Joi.string().allow('', null),
    lastID: Joi.string().allow('', null),
});

// work request details validation schema
module.exports.workRequestDetailsSchema = Joi.object().keys({
    id: Joi.string().required(),
});

// work request assign validation schema
module.exports.workRequestAssignSchema = Joi.object().keys({
    id: Joi.string().required(),
    assigned_to: Joi.string().required(),
});

// work request create validation schema
module.exports.workRequestCreateSchema = Joi.object().keys({
    user_id: Joi.string().required(),
    type: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    client_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    sla: Joi.string().required(),
    priority: Joi.string().required(),
    files: Joi.array().empty(Joi.array().length(0)),
    tags: Joi.array().empty(Joi.array().length(0)),
    status: Joi.string().valid('active', 'completed', 'paused').required(),
    complition_date: Joi.string().optional().allow('', null),
    paused_date: Joi.string().optional().allow('', null),
});

// completed work request validation schema
module.exports.completedWorkRequestSchema = Joi.object().keys({
    id: Joi.string().required(),
    completion_remarks: Joi.string().optional().allow('', null),
});

// paused work request validation schema
module.exports.pausedWorkRequestSchema = Joi.object().keys({
    id: Joi.string().required(),
    paused_remarks: Joi.string().optional().allow('', null),
});
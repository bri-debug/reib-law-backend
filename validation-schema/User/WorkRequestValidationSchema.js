const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// work request create validation schema
module.exports.workRequestCreateSchema = Joi.object().keys({
    type: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    client_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    sla: Joi.string().required(),
    priority: Joi.string().required(),
    files: Joi.array().empty(Joi.array().length(0)),
});

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
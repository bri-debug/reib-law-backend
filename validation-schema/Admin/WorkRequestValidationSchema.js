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
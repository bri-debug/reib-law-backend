const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// work member create validation schema
module.exports.workMemberCreateSchema = Joi.object().keys({
    workspace_id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
});
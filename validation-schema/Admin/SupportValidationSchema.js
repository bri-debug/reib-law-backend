const Joi = require('joi');

module.exports.supportThreadSchema = Joi.object().keys({
    workspace_id: Joi.string().required(),
});

module.exports.sendSupportMessageSchema = Joi.object().keys({
    workspace_id: Joi.string().required(),
    message: Joi.string().trim().required(),
    importance: Joi.string().valid('normal', 'important', 'urgent').default('normal'),
});

const Joi = require('joi');

module.exports.sendSupportMessageSchema = Joi.object().keys({
    message: Joi.string().trim().required(),
    importance: Joi.string().valid('normal', 'important', 'urgent').default('normal'),
});

const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// plan create validation
module.exports.planCreateSchema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().required(),
    initiation_fee: Joi.number().required(),
    benefits: Joi.array().empty(Joi.array().length(0)),
});

// plan update validation
module.exports.planUpdateSchema = Joi.object().keys({
    _id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().required(),
    initiation_fee: Joi.number().required(),
    benefits: Joi.array().empty(Joi.array().length(0)),
});

// plan delete validation
module.exports.planDeleteSchema = Joi.object().keys({
    _id: Joi.string().required(),
});
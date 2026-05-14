const Joi = require('joi');
const scheduleCallHelper = require('../../helpers/scheduleCallHelper');

const answerSchema = Joi.string().valid('yes', 'no').required();

const timezoneField = Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
        if (!scheduleCallHelper.isValidTimeZone(value)) {
            return helpers.message('"timezone" must be a valid IANA time zone');
        }

        return value;
    });

module.exports.availabilitySchema = Joi.object().keys({
    date: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    timezone: timezoneField,
});

module.exports.createScheduleCallSchema = Joi.object().keys({
    date: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    time: Joi.string().trim().valid(...scheduleCallHelper.TIME_SLOT_LABELS).required(),
    timezone: timezoneField,
    full_name: Joi.string().trim().max(100).required(),
    email: Joi.string().trim().email().max(255).required(),
    phone: Joi.string().trim().pattern(/^[0-9()+\-\s]{7,20}$/).required(),
    business_rating: Joi.number().integer().min(1).max(10).required(),
    intake_answers: Joi.object()
        .keys({
            contracts: answerSchema,
            policies: answerSchema,
            personnel: answerSchema,
            ip: answerSchema,
            newProducts: answerSchema,
            ventures: answerSchema,
        })
        .required(),
    focus_topics: Joi.string().trim().min(10).max(1000).required(),
    guest_emails: Joi.array().items(Joi.string().trim().email().max(255)).max(10).default([]),
    agreed_to_terms: Joi.boolean().valid(true).required(),
});

const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate); // extend Joi with Joi Date

// register validation
module.exports.signupSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string()
        .email()
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)
        .required()
        .messages({
            'any.required': `"email" is a required field`,
            'string.pattern.base': `"email" should be in lowercase`,
        }),
    phone: Joi.string().regex(/^[0-9]{10}$/).required(),
    password: Joi.string().min(8).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

// login validation
module.exports.signinSchema = Joi.object().keys({
    email: Joi.string()
        .email()
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)
        .required()
        .messages({
            'any.required': `"email" is a required field`,
            'string.pattern.base': `"email" should be in lowercase`,
        }),
    password: Joi.string().min(8).required(),
});

// forget password validation
module.exports.forgetPasswordSchema = Joi.object().keys({
    email: Joi.string()
        .email()
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)
        .required()
        .messages({
            'any.required': `"email" is a required field`,
            'string.pattern.base': `"email" should be in lowercase`,
        }),
});

// reset password validation
module.exports.resetPasswordSchema = Joi.object().keys({
    otp: Joi.number().required().messages({'any.required': `"otp" is a required field`,}),
    password: Joi.string().min(8).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

// profile update validation
module.exports.profileUpdateSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string()
        .email()
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)
        .required()
        .messages({
            'any.required': `"email" is a required field`,
            'string.pattern.base': `"email" should be in lowercase`,
        }),
    phone: Joi.string().regex(/^[0-9]{10}$/).required(),
});

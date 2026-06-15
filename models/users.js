const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    business_name: String,
    password: String,
    status: String,
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    otp: Number,
    otp_valid: Number,
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
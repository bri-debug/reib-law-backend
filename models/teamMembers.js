const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    status: String,
    otp: Number,
    otp_valid: Number,
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

module.exports = TeamMember;
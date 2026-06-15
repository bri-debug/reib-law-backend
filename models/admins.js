const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: String,
    status: String,
    otp: Number,
    otp_valid: Number,
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
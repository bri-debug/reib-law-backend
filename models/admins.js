const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
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

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
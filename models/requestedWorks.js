const mongoose = require('mongoose');

const RequestedWorkSchema = new mongoose.Schema({
    user_id: String,
    type: String,
    title: String,
    description: String,
    client_name: String,
    email: String,
    phone: String,
    sla: String,
    priority: String,
    files: [String],
    status: String,
    internal_notes: String,
    assigned_to: String,
    complition_date: Date,
    completion_remarks: String,
    tags: [String],
    is_deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const RequestedWork = mongoose.model('RequestedWork', RequestedWorkSchema);

module.exports = RequestedWork;
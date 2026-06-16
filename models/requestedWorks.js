const mongoose = require('mongoose');

const RequestedWorkSchema = new mongoose.Schema({
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
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
    paused_date: Date,
    completion_remarks: String,
    paused_remarks: String,
    tags: [String],
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const RequestedWork = mongoose.model('RequestedWork', RequestedWorkSchema);

module.exports = RequestedWork;
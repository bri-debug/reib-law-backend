const mongoose = require('mongoose');

const WorkspaceMemberSchema = new mongoose.Schema({
    workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    permissions: {
        create_work_request: { type: Boolean, required: true, default: false },
        chat_support: { type: Boolean, required: true, default: false },
        manage_members: { type: Boolean, required: true, default: false }
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const WorkspaceMember = mongoose.model('WorkspaceMember', WorkspaceMemberSchema);

module.exports = WorkspaceMember;
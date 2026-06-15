const mongoose = require('mongoose');

const SupportConversationSchema = new mongoose.Schema({
    workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    client_name: { type: String, required: true },
    client_email: { type: String, required: true },
    last_message: { type: String, default: '' },
    last_message_sender: { type: String, enum: ['client', 'admin'], default: 'client' },
    last_message_importance: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    last_message_at: { type: Date, default: Date.now },
    unread_for_admin: { type: Number, default: 0 },
    unread_for_client: { type: Number, default: 0 },
    has_urgent: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const SupportConversation = mongoose.model('SupportConversation', SupportConversationSchema);

module.exports = SupportConversation;

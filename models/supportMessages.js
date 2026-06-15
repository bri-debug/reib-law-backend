const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SupportConversation' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender_role: { type: String, enum: ['client', 'admin'], required: true },
    sender_id: { type: String, required: true },
    sender_name: { type: String, required: true },
    message: { type: String, required: true },
    importance: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema);

module.exports = SupportMessage;

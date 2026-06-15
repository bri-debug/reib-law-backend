const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
        company_name: { type: String, trim: true }
    }
}, {
    timestamps: true
});

const Workspace = mongoose.model('Workspace', WorkspaceSchema);

module.exports = Workspace;
const mongoose = require('mongoose');

const ResourceCenterDocsSchema = new mongoose.Schema({
    title: String,
    file_url: String,
    file_type: String,
    resource_type: String,
    is_deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const ResourceCenterDocs = mongoose.model('ResourceCenterDocs', ResourceCenterDocsSchema);

module.exports = ResourceCenterDocs;
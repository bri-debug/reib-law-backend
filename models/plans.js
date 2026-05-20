const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: [
        {
            currency: { type: String, required: true },
            amount: { type: Number, required: true },
            initiation_fee: { type: Number, required: true },
            type: { type: String, enum: ['monthly', 'yearly'], required: true }
        }
    ],
    benefits: [String],
    active_client: Number,
    is_deleted: { type: Boolean, default: false }
}, { timestamps: true });

const Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
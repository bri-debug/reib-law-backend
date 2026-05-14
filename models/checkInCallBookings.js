const mongoose = require('mongoose');

const CheckInCallBookingSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        full_name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        timezone: { type: String, required: true, trim: true },
        scheduled_date: { type: String, required: true },
        scheduled_start_time: { type: String, required: true },
        scheduled_end_time: { type: String, required: true },
        slot_duration_minutes: { type: Number, required: true, default: 30 },
        slot_start_at_utc: { type: Date, required: true },
        slot_end_at_utc: { type: Date, required: true },
        business_rating: { type: Number, required: true, min: 1, max: 10 },
        intake_answers: {
            contracts: { type: String, enum: ['yes', 'no'], required: true },
            policies: { type: String, enum: ['yes', 'no'], required: true },
            personnel: { type: String, enum: ['yes', 'no'], required: true },
            ip: { type: String, enum: ['yes', 'no'], required: true },
            newProducts: { type: String, enum: ['yes', 'no'], required: true },
            ventures: { type: String, enum: ['yes', 'no'], required: true },
        },
        focus_topics: { type: String, required: true, trim: true },
        guest_emails: [{ type: String, trim: true, lowercase: true }],
        agreed_to_terms: { type: Boolean, required: true, default: true },
        source: { type: String, required: true, default: 'client_portal' },
        status: {
            type: String,
            enum: ['scheduled', 'cancelled', 'completed'],
            required: true,
            default: 'scheduled',
        },
        is_deleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

CheckInCallBookingSchema.index(
    { slot_start_at_utc: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: 'scheduled',
            is_deleted: false,
        },
        name: 'uniq_active_check_in_call_slot',
    }
);

CheckInCallBookingSchema.index({ user_id: 1, slot_start_at_utc: -1 });
CheckInCallBookingSchema.index({ status: 1, slot_start_at_utc: 1 });

const CheckInCallBooking = mongoose.model('CheckInCallBooking', CheckInCallBookingSchema);

module.exports = CheckInCallBooking;

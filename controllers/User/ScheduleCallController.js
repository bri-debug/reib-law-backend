const CheckInCallBooking = require('../../models/checkInCallBookings');
const Users = require('../../models/users');
const scheduleCallHelper = require('../../helpers/scheduleCallHelper');
const responseMessages = require('../../ResponseMessages');

function mapBookingResponse(booking) {
    return {
        _id: booking._id,
        user_id: booking.user_id,
        full_name: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        timezone: booking.timezone,
        scheduled_date: booking.scheduled_date,
        scheduled_start_time: booking.scheduled_start_time,
        scheduled_end_time: booking.scheduled_end_time,
        slot_start_at_utc: booking.slot_start_at_utc,
        slot_end_at_utc: booking.slot_end_at_utc,
        business_rating: booking.business_rating,
        intake_answers: booking.intake_answers,
        focus_topics: booking.focus_topics,
        guest_emails: booking.guest_emails,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    };
}

/*
|------------------------------------------------
| API name          :  checkInCallAvailability
| Response          :  Respective response message in JSON format
| Logic             :  Fetch availability for check-in call slots
| Request URL       :  BASE_URL/api/check_in_call_availability
| Request method    :  GET
|------------------------------------------------
*/
module.exports.checkInCallAvailability = (req, res) => {
    (async () => {
        const purpose = 'Check-In Call Availability';

        try {
            const { date, timezone } = req.query;
            const slots = scheduleCallHelper.getSlotsForDate(date, timezone);
            const sortedSlots = [...slots].sort(
                (leftSlot, rightSlot) => leftSlot.slotStartAtUtc.getTime() - rightSlot.slotStartAtUtc.getTime()
            );
            const rangeStart = sortedSlots[0].slotStartAtUtc;
            const rangeEnd = sortedSlots[sortedSlots.length - 1].slotEndAtUtc;

            const existingBookings = await CheckInCallBooking.find({
                status: 'scheduled',
                is_deleted: false,
                slot_start_at_utc: { $gte: rangeStart, $lt: rangeEnd },
            }).select('slot_start_at_utc slot_end_at_utc');

            const bookedStartTimes = new Set(
                existingBookings.map((booking) => booking.slot_start_at_utc.getTime())
            );
            const now = new Date();

            return res.status(200).send({
                status: 200,
                msg: responseMessages.checkInCallAvailabilityFetched,
                data: {
                    date,
                    timezone,
                    slotDurationMinutes: scheduleCallHelper.SLOT_DURATION_MINUTES,
                    slots: slots.map((slot) => ({
                        time: slot.timeLabel,
                        end_time: slot.endTimeLabel,
                        start_at_utc: slot.slotStartAtUtc,
                        end_at_utc: slot.slotEndAtUtc,
                        is_available:
                            slot.slotStartAtUtc.getTime() > now.getTime() &&
                            !bookedStartTimes.has(slot.slotStartAtUtc.getTime()),
                    })),
                },
                purpose,
            });
        } catch (error) {
            console.log('Check-In Call Availability Error: ', error);
            return res.status(400).send({
                status: 400,
                msg: error.message || responseMessages.serverError,
                data: {},
                purpose,
            });
        }
    })();
};

/*
|------------------------------------------------
| API name          :  createCheckInCallBooking
| Response          :  Respective response message in JSON format
| Logic             :  Create a new check-in call booking
| Request URL       :  BASE_URL/api/schedule_check_in_call
| Request method    :  POST
|------------------------------------------------
*/
module.exports.createCheckInCallBooking = (req, res) => {
    (async () => {
        const purpose = 'Create Check-In Call Booking';

        try {
            const userID = req.headers.userID;
            const body = req.body;

            const user = await Users.findOne({
                _id: userID,
                is_active: true,
                is_deleted: false,
            }).select('_id');

            if (!user) {
                return res.status(401).send({
                    status: 401,
                    msg: responseMessages.authFailure,
                    data: {},
                    purpose,
                });
            }

            const slot = scheduleCallHelper.getSlotBounds(body.date, body.time, body.timezone);

            if (slot.slotStartAtUtc.getTime() <= Date.now()) {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.checkInCallPastSlot,
                    data: {},
                    purpose,
                });
            }

            const overlappingBooking = await CheckInCallBooking.findOne({
                status: 'scheduled',
                is_deleted: false,
                slot_start_at_utc: { $lt: slot.slotEndAtUtc },
                slot_end_at_utc: { $gt: slot.slotStartAtUtc },
            }).select('_id');

            if (overlappingBooking) {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.checkInCallSlotUnavailable,
                    data: {},
                    purpose,
                });
            }

            const bookingPayload = {
                user_id: userID,
                full_name: body.full_name.trim(),
                email: body.email.trim().toLowerCase(),
                phone: body.phone.trim(),
                timezone: body.timezone.trim(),
                scheduled_date: body.date,
                scheduled_start_time: body.time,
                scheduled_end_time: slot.endTimeLabel,
                slot_duration_minutes: scheduleCallHelper.SLOT_DURATION_MINUTES,
                slot_start_at_utc: slot.slotStartAtUtc,
                slot_end_at_utc: slot.slotEndAtUtc,
                business_rating: body.business_rating,
                intake_answers: body.intake_answers,
                focus_topics: body.focus_topics.trim(),
                guest_emails: scheduleCallHelper.normalizeGuestEmails(body.guest_emails),
                agreed_to_terms: true,
                status: 'scheduled',
                is_deleted: false,
            };

            const booking = await CheckInCallBooking.create(bookingPayload);

            return res.status(200).send({
                status: 200,
                msg: responseMessages.checkInCallBooked,
                data: mapBookingResponse(booking),
                purpose,
            });
        } catch (error) {
            console.log('Create Check-In Call Booking Error: ', error);

            if (error && error.code === 11000) {
                return res.status(409).send({
                    status: 409,
                    msg: responseMessages.checkInCallSlotUnavailable,
                    data: {},
                    purpose,
                });
            }

            return res.status(500).send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose,
            });
        }
    })();
};

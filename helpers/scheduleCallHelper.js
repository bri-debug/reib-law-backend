const SLOT_DURATION_MINUTES = 30;
const TIME_SLOT_LABELS = ['01:30 AM', '02:00 AM', '09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];

function isValidTimeZone(timeZone) {
    try {
        Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
        return true;
    } catch (error) {
        return false;
    }
}

function parseLocalDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error('Invalid date format');
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const probe = new Date(Date.UTC(year, month - 1, day));

    if (
        probe.getUTCFullYear() !== year ||
        probe.getUTCMonth() !== month - 1 ||
        probe.getUTCDate() !== day
    ) {
        throw new Error('Invalid calendar date');
    }

    return { year, month, day };
}

function parseTimeLabel(timeLabel) {
    if (!TIME_SLOT_LABELS.includes(timeLabel)) {
        throw new Error('Invalid time slot');
    }

    const [timePart, meridiem] = timeLabel.split(' ');
    const [hourString, minuteString] = timePart.split(':');

    let hour = Number(hourString);
    const minute = Number(minuteString);

    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour !== 12) hour += 12;

    return { hour, minute };
}

function getTimeZoneParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });

    const values = {};

    formatter.formatToParts(date).forEach((part) => {
        if (part.type !== 'literal') {
            values[part.type] = Number(part.value);
        }
    });

    return {
        year: values.year,
        month: values.month,
        day: values.day,
        hour: values.hour,
        minute: values.minute,
        second: values.second,
    };
}

function partsToUtcMs(parts) {
    return Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second || 0,
        0
    );
}

function zonedTimeToUtc(dateString, timeLabel, timeZone) {
    if (!isValidTimeZone(timeZone)) {
        throw new Error('Invalid time zone');
    }

    const { year, month, day } = parseLocalDate(dateString);
    const { hour, minute } = parseTimeLabel(timeLabel);

    const desiredParts = {
        year,
        month,
        day,
        hour,
        minute,
        second: 0,
    };

    let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const zonedParts = getTimeZoneParts(guess, timeZone);
        const diffMs = partsToUtcMs(desiredParts) - partsToUtcMs(zonedParts);

        if (diffMs === 0) {
            return guess;
        }

        guess = new Date(guess.getTime() + diffMs);
    }

    const finalParts = getTimeZoneParts(guess, timeZone);

    if (
        finalParts.year !== desiredParts.year ||
        finalParts.month !== desiredParts.month ||
        finalParts.day !== desiredParts.day ||
        finalParts.hour !== desiredParts.hour ||
        finalParts.minute !== desiredParts.minute
    ) {
        throw new Error('Unable to resolve slot in selected time zone');
    }

    return guess;
}

function endTimeFor(timeLabel) {
    const slotStart = zonedTimeToUtc('2026-01-01', timeLabel, 'UTC');
    const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    return slotEnd.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function getSlotBounds(dateString, timeLabel, timeZone) {
    const slotStartAtUtc = zonedTimeToUtc(dateString, timeLabel, timeZone);
    const slotEndAtUtc = new Date(slotStartAtUtc.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    return {
        timeLabel,
        endTimeLabel: endTimeFor(timeLabel),
        slotStartAtUtc,
        slotEndAtUtc,
    };
}

function getSlotsForDate(dateString, timeZone) {
    return TIME_SLOT_LABELS.map((timeLabel) => {
        const bounds = getSlotBounds(dateString, timeLabel, timeZone);
        return {
            timeLabel,
            endTimeLabel: bounds.endTimeLabel,
            slotStartAtUtc: bounds.slotStartAtUtc,
            slotEndAtUtc: bounds.slotEndAtUtc,
        };
    });
}

function normalizeGuestEmails(guestEmails = []) {
    const normalized = guestEmails
        .map((guestEmail) => String(guestEmail || '').trim().toLowerCase())
        .filter(Boolean);

    return [...new Set(normalized)];
}

module.exports = {
    SLOT_DURATION_MINUTES,
    TIME_SLOT_LABELS,
    getSlotBounds,
    getSlotsForDate,
    isValidTimeZone,
    normalizeGuestEmails,
};

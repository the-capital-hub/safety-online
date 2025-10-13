export function getStartOfDay(dateInput) {
        const date = new Date(dateInput);
        date.setHours(0, 0, 0, 0);
        return date;
}

export function getEndOfDay(dateInput) {
        const date = new Date(dateInput);
        date.setHours(23, 59, 59, 999);
        return date;
}

export function normalizeDateRange(startInput, endInput) {
        return {
                start: getStartOfDay(startInput),
                end: getEndOfDay(endInput),
        };
}

export function getDateRangeStatus(startInput, endInput, referenceDate = new Date()) {
        const { start, end } = normalizeDateRange(startInput, endInput);

        if (referenceDate > end) {
                return "Expired";
        }

        if (referenceDate < start) {
                return "Scheduled";
        }

        return "Active";
}

export function isWithinDateRange(startInput, endInput, referenceDate = new Date()) {
        const { start, end } = normalizeDateRange(startInput, endInput);
        return referenceDate >= start && referenceDate <= end;
}

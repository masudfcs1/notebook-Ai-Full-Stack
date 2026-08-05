"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromUTC = exports.toUTC = exports.getDifferenceInDays = exports.getDifferenceInSeconds = exports.isExpired = exports.addMinutes = exports.addDays = exports.getCurrentDate = exports.formatDate = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return (0, dayjs_1.default)(date).format(format);
};
exports.formatDate = formatDate;
const getCurrentDate = () => {
    return (0, dayjs_1.default)().toDate();
};
exports.getCurrentDate = getCurrentDate;
const addDays = (date, days) => {
    return (0, dayjs_1.default)(date).add(days, 'day').toDate();
};
exports.addDays = addDays;
const addMinutes = (date, minutes) => {
    return (0, dayjs_1.default)(date).add(minutes, 'minute').toDate();
};
exports.addMinutes = addMinutes;
const isExpired = (date) => {
    return (0, dayjs_1.default)(date).isBefore((0, dayjs_1.default)());
};
exports.isExpired = isExpired;
const getDifferenceInSeconds = (start, end) => {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'second');
};
exports.getDifferenceInSeconds = getDifferenceInSeconds;
const getDifferenceInDays = (start, end) => {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'day');
};
exports.getDifferenceInDays = getDifferenceInDays;
const toUTC = (date) => {
    return (0, dayjs_1.default)(date).utc().toDate();
};
exports.toUTC = toUTC;
const fromUTC = (date, tz = 'Asia/Kolkata') => {
    return dayjs_1.default.utc(date).tz(tz).toDate();
};
exports.fromUTC = fromUTC;
//# sourceMappingURL=date.js.map
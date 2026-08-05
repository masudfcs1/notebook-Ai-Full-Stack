"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = exports.generatePasswordResetToken = exports.generateVerificationToken = exports.generateUniqueCode = exports.generateSlug = exports.generateUUID = exports.generateRandomString = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto_1.default.randomInt(0, digits.length);
        otp += digits[randomIndex];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const generateRandomString = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex').slice(0, length);
};
exports.generateRandomString = generateRandomString;
const generateUUID = () => {
    return (0, uuid_1.v4)();
};
exports.generateUUID = generateUUID;
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.generateSlug = generateSlug;
const generateUniqueCode = (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const randomPart = (0, exports.generateRandomString)(6);
    return `${prefix}${timestamp}${randomPart}`.toUpperCase();
};
exports.generateUniqueCode = generateUniqueCode;
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateVerificationToken = generateVerificationToken;
const generatePasswordResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generatePasswordResetToken = generatePasswordResetToken;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
//# sourceMappingURL=generators.js.map
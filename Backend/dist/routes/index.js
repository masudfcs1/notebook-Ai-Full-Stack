"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = __importDefault(require("../modules/auth/route"));
const route_2 = __importDefault(require("../modules/user/route"));
const route_3 = __importDefault(require("../modules/role/route"));
const router = (0, express_1.Router)();
router.use('/auth', route_1.default);
router.use('/users', route_2.default);
router.use('/roles', route_3.default);
exports.default = router;
//# sourceMappingURL=index.js.map
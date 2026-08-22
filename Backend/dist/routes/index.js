"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = __importDefault(require("../modules/auth/route"));
const route_2 = __importDefault(require("../modules/user/route"));
const route_3 = __importDefault(require("../modules/role/route"));
const route_4 = __importDefault(require("../modules/workspace/route"));
const route_5 = __importDefault(require("../modules/team/route"));
const route_6 = __importDefault(require("../modules/notification/route"));
const router = (0, express_1.Router)();
router.use('/auth', route_1.default);
router.use('/users', route_2.default);
router.use('/roles', route_3.default);
router.use('/workspaces', route_4.default);
router.use('/teams', route_5.default);
router.use('/notifications', route_6.default);
exports.default = router;
//# sourceMappingURL=index.js.map
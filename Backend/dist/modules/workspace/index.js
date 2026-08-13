"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceController = exports.workspaceRepository = exports.workspaceService = exports.workspaceRoutes = void 0;
var route_1 = require("./route");
Object.defineProperty(exports, "workspaceRoutes", { enumerable: true, get: function () { return __importDefault(route_1).default; } });
var service_1 = require("./service");
Object.defineProperty(exports, "workspaceService", { enumerable: true, get: function () { return service_1.workspaceService; } });
var repository_1 = require("./repository");
Object.defineProperty(exports, "workspaceRepository", { enumerable: true, get: function () { return repository_1.workspaceRepository; } });
var controller_1 = require("./controller");
Object.defineProperty(exports, "workspaceController", { enumerable: true, get: function () { return controller_1.workspaceController; } });
__exportStar(require("./types"), exports);
__exportStar(require("./dto"), exports);
//# sourceMappingURL=index.js.map
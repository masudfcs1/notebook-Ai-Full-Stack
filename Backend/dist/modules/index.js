"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRepository = exports.workspaceService = exports.workspaceRoutes = exports.roleService = exports.roleRoutes = exports.userRepository = exports.userService = exports.userRoutes = exports.authRepository = exports.authService = exports.authRoutes = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return auth_1.authRoutes; } });
Object.defineProperty(exports, "authService", { enumerable: true, get: function () { return auth_1.authService; } });
Object.defineProperty(exports, "authRepository", { enumerable: true, get: function () { return auth_1.authRepository; } });
var user_1 = require("./user");
Object.defineProperty(exports, "userRoutes", { enumerable: true, get: function () { return user_1.userRoutes; } });
Object.defineProperty(exports, "userService", { enumerable: true, get: function () { return user_1.userService; } });
Object.defineProperty(exports, "userRepository", { enumerable: true, get: function () { return user_1.userRepository; } });
var role_1 = require("./role");
Object.defineProperty(exports, "roleRoutes", { enumerable: true, get: function () { return role_1.roleRoutes; } });
Object.defineProperty(exports, "roleService", { enumerable: true, get: function () { return role_1.roleService; } });
var workspace_1 = require("./workspace");
Object.defineProperty(exports, "workspaceRoutes", { enumerable: true, get: function () { return workspace_1.workspaceRoutes; } });
Object.defineProperty(exports, "workspaceService", { enumerable: true, get: function () { return workspace_1.workspaceService; } });
Object.defineProperty(exports, "workspaceRepository", { enumerable: true, get: function () { return workspace_1.workspaceRepository; } });
//# sourceMappingURL=index.js.map
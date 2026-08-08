"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.verifyTokenMiddleware = void 0;
var auth_js_1 = require("../config/auth.js");
var verifyTokenMiddleware = function (req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    var token = authHeader.split('Bearer ')[1];
    try {
        var decoded = (0, auth_js_1.verifyToken)(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};
exports.verifyTokenMiddleware = verifyTokenMiddleware;
var requireAdmin = function (req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;

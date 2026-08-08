"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET;
var JWT_EXPIRES_IN = '7d';
function signToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}

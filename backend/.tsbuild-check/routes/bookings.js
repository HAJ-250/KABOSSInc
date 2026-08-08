"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Booking_js_1 = require("../models/Booking.js");
var Service_js_1 = require("../models/Service.js");
var auth_js_1 = require("../middleware/auth.js");
var zod_1 = require("zod");
var router = (0, express_1.Router)();
var bookingSchema = zod_1.z.object({
    serviceId: zod_1.z.number().or(zod_1.z.string()),
    serviceName: zod_1.z.string(),
    details: zod_1.z.string().min(10),
    date: zod_1.z.string(),
    time: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
});
var statusSchema = zod_1.z.object({ status: zod_1.z.enum(['pending', 'approved', 'in-progress', 'completed', 'cancelled']) });
// Resolve a string service slug/id to a numeric serviceId from the Service table.
// If the service is a numeric id, use it directly. Otherwise, look up by slug/category.
function resolveServiceId(serviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var slug, service;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof serviceId === 'number')
                        return [2 /*return*/, serviceId];
                    slug = String(serviceId).trim();
                    // If it's already a numeric string, return it directly.
                    if (/^\d+$/.test(slug))
                        return [2 /*return*/, parseInt(slug, 10)];
                    return [4 /*yield*/, Service_js_1.default.findOne({ where: { category: slug } })];
                case 1:
                    service = _a.sent();
                    return [2 /*return*/, service ? service.id : 0]; // fallback to 0 if no matching service
            }
        });
    });
}
router.get('/', auth_js_1.verifyTokenMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bookings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Booking_js_1.default.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] })];
            case 1:
                bookings = _a.sent();
                res.json(bookings);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Failed to fetch bookings:', error_1);
                res.status(500).json({ error: 'Failed to fetch bookings' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/', auth_js_1.verifyTokenMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, serviceId, booking_1, Notification_1, User, admins, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                data = bookingSchema.parse(req.body);
                return [4 /*yield*/, resolveServiceId(data.serviceId)];
            case 1:
                serviceId = _a.sent();
                return [4 /*yield*/, Booking_js_1.default.create({
                        userId: parseInt(req.userId),
                        serviceId: serviceId,
                        serviceName: data.serviceName,
                        details: data.details,
                        date: data.date,
                        time: data.time,
                        location: data.location,
                        status: 'pending',
                    })];
            case 2:
                booking_1 = _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../models/Notification.js'); })];
            case 3:
                Notification_1 = (_a.sent()).default;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../models/User.js'); })];
            case 4:
                User = (_a.sent()).default;
                // user notification
                return [4 /*yield*/, Notification_1.create({
                        userId: parseInt(req.userId),
                        type: 'booking',
                        title: 'Booking submitted',
                        body: "Your booking for \"".concat(booking_1.serviceName, "\" has been submitted and is pending approval."),
                        isRead: false,
                    })];
            case 5:
                // user notification
                _a.sent();
                return [4 /*yield*/, User.findAll({ where: { role: 'admin' }, attributes: ['id'] })];
            case 6:
                admins = _a.sent();
                return [4 /*yield*/, Promise.all(admins.map(function (a) {
                        return Notification_1.create({
                            userId: Number(a.getDataValue('id')),
                            type: 'booking',
                            title: 'New booking request',
                            body: "New booking for \"".concat(booking_1.serviceName, "\" from user #").concat(booking_1.userId, "."),
                            isRead: false,
                        });
                    }))];
            case 7:
                _a.sent();
                res.status(201).json(booking_1);
                return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                if (error_2 instanceof zod_1.z.ZodError)
                    return [2 /*return*/, res.status(400).json({ error: error_2.errors })];
                console.error('Failed to create booking:', error_2);
                res.status(500).json({ error: 'Failed to create booking' });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
router.patch('/:id/status', auth_js_1.verifyTokenMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, booking_2, prevStatus, Notification_2, User, admins, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                status_1 = statusSchema.parse(req.body).status;
                return [4 /*yield*/, Booking_js_1.default.findByPk(req.params.id)];
            case 1:
                booking_2 = _a.sent();
                if (!booking_2)
                    return [2 /*return*/, res.status(404).json({ error: 'Booking not found' })];
                if (String(booking_2.userId) !== req.userId && req.userRole !== 'admin')
                    return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You can only update your own bookings' })];
                prevStatus = booking_2.status;
                booking_2.status = status_1;
                return [4 /*yield*/, booking_2.save()];
            case 2:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../models/Notification.js'); })];
            case 3:
                Notification_2 = (_a.sent()).default;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../models/User.js'); })];
            case 4:
                User = (_a.sent()).default;
                // user notification
                return [4 /*yield*/, Notification_2.create({
                        userId: booking_2.userId,
                        type: 'status_update',
                        title: 'Booking status updated',
                        body: "Your booking (\"".concat(booking_2.serviceName, "\") status changed from ").concat(prevStatus, " to ").concat(status_1, "."),
                        isRead: false,
                    })];
            case 5:
                // user notification
                _a.sent();
                if (!(req.userRole === 'admin')) return [3 /*break*/, 8];
                return [4 /*yield*/, User.findAll({ where: { role: 'admin' }, attributes: ['id'] })];
            case 6:
                admins = _a.sent();
                return [4 /*yield*/, Promise.all(admins.map(function (a) {
                        return Notification_2.create({
                            userId: Number(a.getDataValue('id')),
                            type: 'status_update',
                            title: 'Booking updated',
                            body: "Booking #".concat(booking_2.id, " status changed to ").concat(status_1, "."),
                            isRead: false,
                        });
                    }))];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                res.json({ message: 'Booking updated' });
                return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                if (error_3 instanceof zod_1.z.ZodError)
                    return [2 /*return*/, res.status(400).json({ error: error_3.errors })];
                console.error('Failed to update booking:', error_3);
                res.status(500).json({ error: 'Failed to update booking' });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
exports.default = router;

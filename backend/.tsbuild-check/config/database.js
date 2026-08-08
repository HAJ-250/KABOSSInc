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
exports.sequelize = void 0;
exports.initDatabase = initDatabase;
exports.stopDatabase = stopDatabase;
var sequelize_1 = require("sequelize");
// If this module is imported before dotenv.config() runs, DATABASE_URL/DB_* might be undefined.
// Ensure env is loaded here as well (safe no-op if already loaded).
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var DB_NAME = process.env.DB_NAME || 'kaboss';
var DB_USER = process.env.DB_USER || 'postgres';
var DB_PASSWORD = process.env.DB_PASSWORD || '';
var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
var DATABASE_URL = process.env.DATABASE_URL;
function getDbHostFromUrl(url) {
    if (!url)
        return null;
    try {
        // postgresql://user:pass@host:port/db?...
        var withoutProto = url.replace(/^\w+:\/\//, '');
        var at = withoutProto.indexOf('@');
        var hostPortAndPath = at >= 0 ? withoutProto.slice(at + 1) : withoutProto;
        var hostPort = hostPortAndPath.split('/')[0];
        return hostPort.split(':')[0] || hostPort;
    }
    catch (_a) {
        return null;
    }
}
var resolvedDbHost = getDbHostFromUrl(DATABASE_URL);
console.log('[db] initDatabase:');
console.log('[db] DATABASE_URL present:', Boolean(DATABASE_URL));
if (DATABASE_URL) {
    // Extract db name from postgresql/mysql URL: scheme://user:pass@host:port/dbname
    var dbNameMatch = DATABASE_URL.match(/\/[a-zA-Z0-9_\-]+(?=\?|$)/);
    var dbNameFromUrl = dbNameMatch ? dbNameMatch[0].replace(/^\//, '') : null;
    console.log('[db] DATABASE_URL host:', resolvedDbHost);
    console.log('[db] DATABASE_URL dbName:', dbNameFromUrl);
}
console.log('[db] DB_* (when no DATABASE_URL):', {
    DB_NAME: DB_NAME,
    DB_USER: DB_USER,
    DB_HOST: DB_HOST,
    DB_PORT: DB_PORT,
});
console.log('[db] Using dialect:', 'mysql');
function extractDbNameFromDatabaseUrl(databaseUrl) {
    if (!databaseUrl)
        return null;
    try {
        // mysql://user:pass@host:port/dbname?...
        var withoutProto = databaseUrl.replace(/^\w+:\/\//, '');
        var slash = withoutProto.indexOf('/');
        if (slash === -1)
            return null;
        var afterSlash = withoutProto.slice(slash + 1);
        var dbPart = afterSlash.split('?')[0].trim();
        return dbPart || null;
    }
    catch (_a) {
        return null;
    }
}
var DATABASE_URL_DB_NAME = extractDbNameFromDatabaseUrl(DATABASE_URL);
exports.sequelize = DATABASE_URL
    ? new sequelize_1.Sequelize(DATABASE_URL, {
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {},
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: false,
        },
    })
    : new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            ssl: {
                require: false,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: false,
        },
    });
function initDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, msg, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('[db] initDatabase details:');
                    console.log('[db]   dialect: mysql');
                    console.log('[db]   using DATABASE_URL:', Boolean(DATABASE_URL));
                    console.log('[db]   DB_NAME:', DB_NAME);
                    console.log('[db]   DB_HOST:', DB_HOST);
                    console.log('[db]   DB_PORT:', DB_PORT);
                    console.log('[db]   DATABASE_URL_DB_NAME(parsed):', DATABASE_URL_DB_NAME);
                    return [4 /*yield*/, exports.sequelize.authenticate()];
                case 1:
                    _a.sent();
                    console.log('Connected to MySQL');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, exports.sequelize.sync({ alter: false })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    msg = String((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || err_1);
                    if (msg.includes('enum_Users_role') || msg.includes('duplicate key value violates unique constraint')) {
                        console.warn('[db] sequelize.sync skipped due to existing enum/type:', msg);
                    }
                    else {
                        throw err_1;
                    }
                    return [3 /*break*/, 5];
                case 5:
                    console.log('Database tables synchronized');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Database connection failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function stopDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.sequelize.close()];
                case 1:
                    _a.sent();
                    console.log('Database connection closed');
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = exports.sequelize;

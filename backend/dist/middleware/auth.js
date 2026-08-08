import { verifyToken } from '../config/auth.js';
/**
 * Middleware that accepts a JWT either from the Authorization header OR from a
 * `?token=` query param. The query-param fallback lets <img>/<video>/<a> tags
 * load protected attachments (browsers cannot set Authorization headers on
 * media requests).
 */
export const verifyTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
    }
    // Query-param fallback for <img> tags (only meaningful for GET requests).
    if (!token && typeof req.query?.token === 'string' && req.query.token) {
        token = req.query.token;
    }
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};
export const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
/**
 * verifyTokenQuery - like verifyTokenMiddleware but also accepts the JWT from a
 * `?token=` query parameter. This is required for `<img src>` attachment previews,
 * which cannot send an Authorization header.
 */
export const verifyTokenQuery = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
    }
    else if (req.query?.token) {
        token = String(req.query.token);
    }
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};
//# sourceMappingURL=auth.js.map
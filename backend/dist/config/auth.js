import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
export function signToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=auth.js.map
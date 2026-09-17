import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        let token = '';

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (req.headers.unique_jwt_key) {
            token = req.headers.unique_jwt_key;
        }

        if (!token) {
            return res.status(401).json({ success: false, msg: "Authentication required. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role
        };

        return next();

    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(401).json({ success: false, msg: "Invalid or expired token." });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                msg: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        return next();
    };
};

// Backwards compatibility alias
export const authZmiddleware = authenticate;
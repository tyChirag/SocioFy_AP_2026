import jwt from "jsonwebtoken";

/**
 * Authentication Middleware
 * Validates the JWT token provided in the Authorization header (Bearer <token>).
 * Attaches the decoded payload ({ userId, collegeEmail }) to req.user.
 * Returns appropriate HTTP 401 responses for missing, invalid, or expired tokens.
 */
export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication token is missing."
            });
        }

        // Token can be sent as "Bearer <token>" or raw "<token>"
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        if (!token || token === "undefined" || token === "null") {
            return res.status(401).json({
                success: false,
                message: "Access denied. Invalid token format."
            });
        }

        const secret = process.env.JWT_SECRET || "sociofy_secret_jwt_key_2026";

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                // Distinguish between expired and malformed tokens
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        success: false,
                        errorType: "TOKEN_EXPIRED",
                        message: "Your session has expired. Please log in again."
                    });
                }

                return res.status(401).json({
                    success: false,
                    errorType: "INVALID_TOKEN",
                    message: "Invalid authentication token. Please log in again."
                });
            }

            // Attach user data from token
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication error occurred."
        });
    }
};

/**
 * Optional Authentication Middleware
 * If a valid token is passed, attaches req.user.
 * If no token is provided (or if token is invalid/expired), it safely ignores it
 * so that feed fetching continues to work smoothly without failing the request.
 */
export const optionalAuthenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];

        if (!authHeader) {
            return next();
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        if (!token || token === "undefined" || token === "null") {
            return next();
        }

        const secret = process.env.JWT_SECRET || "sociofy_secret_jwt_key_2026";

        jwt.verify(token, secret, (err, decoded) => {
            if (!err && decoded) {
                req.user = decoded;
            }
            // Continue request without failing even if token is expired or invalid
            next();
        });
    } catch {
        next();
    }
};

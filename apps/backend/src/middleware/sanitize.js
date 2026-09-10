/**
 * Input sanitization middleware
 * Prevents XSS and basic injection attacks
 */

// XSS sanitization pattern
const XSS_PATTERN = /(<script[^>]*>.*?<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<applet|<form|<input[^>]*type=["']?hidden)/gi;

// Sanitize string input
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(XSS_PATTERN, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .trim();
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[sanitizeString(key)] = sanitizeObject(value);
        }
        return sanitized;
    }
    
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    
    return obj;
};

/**
 * Sanitize incoming request body (mutates in place — req.body may be
 * getter-backed on some Express versions, so never reassign it).
 */
export const sanitizeBody = (req, res, next) => {
    // Skip raw bodies (Paystack webhook uses express.raw() → Buffer).
    // HMAC verification needs the untouched bytes; do not mutate.
    if (!req.body || typeof req.body !== 'object' || Buffer.isBuffer(req.body)) {
        return next();
    }
    if (req.body && typeof req.body === 'object') {
        const clean = sanitizeObject(req.body);
        // Mutate in place to preserve the original object reference
        for (const k of Object.keys(req.body)) delete req.body[k];
        Object.assign(req.body, clean);
    }
    next();
};

/**
 * Sanitize query parameters (mutates in place — Express 5 exposes
 * req.query as a getter-only property, so reassignment throws).
 */
export const sanitizeQuery = (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
        const clean = sanitizeObject(req.query);
        for (const k of Object.keys(req.query)) delete req.query[k];
        Object.assign(req.query, clean);
    }
    next();
};

/**
 * Validate MongoDB query patterns to prevent injection
 */
export const validateQueryPattern = (req, res, next) => {
    const validateValue = (value) => {
        if (typeof value !== 'string') return true;
        
        // Check for MongoDB operator injection
        if (value.startsWith('$')) return false;
        
        // Check for regex patterns that could be malicious
        if (value.includes('/.*') || value.includes('.*')) return false;
        
        return true;
    };

    const validateObject = (obj) => {
        if (!obj || typeof obj !== 'object') return true;
        
        for (const key in obj) {
            if (key === '$regex' || key === '$options') {
                return false;
            }
            if (typeof obj[key] === 'string' && !validateValue(obj[key])) {
                return false;
            }
            if (typeof obj[key] === 'object') {
                if (!validateObject(obj[key])) return false;
            }
        }
        return true;
    };

    if (!validateObject(req.query)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid query parameters'
        });
    }

    next();
};

export default {
    sanitizeBody,
    sanitizeQuery,
    validateQueryPattern,
};

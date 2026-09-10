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
 * Sanitize incoming request body
 */
export const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
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

export function sendSuccess(res, data, statusCode = 200, pagination) {
    res.status(statusCode).json({
        success: true,
        data,
        ...(pagination ? { pagination } : {})
    });
}
export function sendError(res, statusCode, code, message, fields) {
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(fields ? { fields } : {})
        }
    });
}

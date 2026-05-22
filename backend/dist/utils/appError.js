export class AppError extends Error {
    statusCode;
    code;
    fields;
    isOperational = true;
    constructor(statusCode, code, message, fields) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        if (fields) {
            this.fields = fields;
        }
    }
}

import { AppError } from "../utils/appError.js";
export function validate(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            next();
        }
        catch (error) {
            next(new AppError(400, "VALIDATION_ERROR", "Validation failed", toFieldErrors(error)));
        }
    };
}
function toFieldErrors(error) {
    const fields = {};
    for (const issue of error.issues) {
        const key = issue.path.join(".") || "request";
        fields[key] = [...(fields[key] ?? []), issue.message];
    }
    return fields;
}

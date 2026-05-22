import { z } from "zod";
import { AppError } from "../utils/appError.js";
export function validate(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                const parsed = schemas.params.parse(req.params);
                for (const key of Object.keys(req.params))
                    delete req.params[key];
                Object.assign(req.params, parsed);
            }
            if (schemas.query) {
                const parsed = schemas.query.parse(req.query);
                for (const key of Object.keys(req.query))
                    delete req.query[key];
                Object.assign(req.query, parsed);
            }
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                next(new AppError(400, "VALIDATION_ERROR", "Validation failed", toFieldErrors(error)));
            }
            else {
                const fields = { request: [error instanceof Error ? error.message : String(error)] };
                next(new AppError(400, "VALIDATION_ERROR", "Validation failed", fields));
            }
        }
    };
}
function toFieldErrors(error) {
    const fields = {};
    try {
        const issues = error.issues ?? [];
        if (!Array.isArray(issues)) {
            fields["request"] = ["Validation failed"];
            return fields;
        }
        for (const issue of issues) {
            const key = issue.path?.join(".") || "request";
            fields[key] = [...(fields[key] ?? []), issue.message];
        }
    }
    catch {
        fields["request"] = [error.message ?? "Validation failed"];
    }
    if (Object.keys(fields).length === 0) {
        fields["request"] = [error.message ?? "Validation failed"];
    }
    return fields;
}

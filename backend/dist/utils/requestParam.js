import { AppError } from "./appError.js";
export function getRequiredParam(req, name) {
    const value = req.params[name];
    if (typeof value !== "string") {
        throw new AppError(400, "VALIDATION_ERROR", `Missing route parameter: ${name}`);
    }
    return value;
}

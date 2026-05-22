import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { verifyAccessToken } from "../utils/jwt.js";
export async function requireAuth(req, _res, next) {
    try {
        const header = req.headers.authorization;
        const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
        if (!token) {
            throw new AppError(401, "UNAUTHORIZED", "No token provided");
        }
        const payload = verifyAccessToken(token);
        const user = await User.findOne({ _id: payload.sub, isDeleted: false }).select("_id email role");
        if (!user) {
            throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            sessionId: payload.sessionId
        };
        next();
    }
    catch (error) {
        next(error);
    }
}

function sanitize(obj) {
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key.startsWith("$") || key.includes(".")) {
                    delete obj[key];
                }
                else {
                    sanitize(obj[key]);
                }
            }
        }
    }
}
export function mongoSanitize() {
    return (req, _res, next) => {
        if (req.body)
            sanitize(req.body);
        if (req.query)
            sanitize(req.query);
        if (req.params)
            sanitize(req.params);
        next();
    };
}

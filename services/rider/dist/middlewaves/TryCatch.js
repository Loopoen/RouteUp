"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            console.error("========== ERROR ==========");
            console.error(err);
            console.error("===========================");
            res.status(500).json({
                message: err.message,
            });
        }
    };
};
exports.default = TryCatch;

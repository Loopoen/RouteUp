"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSeller = void 0;
const isSeller = (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Bạn chưa đăng nhập"
            });
            return;
        }
        if (req.user.role !== "seller") {
            res.status(403).json({
                message: "Bạn không có quyền seller"
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi kiểm tra quyền seller"
        });
    }
};
exports.isSeller = isSeller;

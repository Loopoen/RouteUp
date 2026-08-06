import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./isAuth"; 

export const isSeller = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi kiểm tra quyền seller"
        });
    }
};
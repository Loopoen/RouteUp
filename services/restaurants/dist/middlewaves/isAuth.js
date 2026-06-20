import jwt from 'jsonwebtoken';
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "dang nhap nhap loi khong co header"
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "dang nhap loi chua co token"
            });
            return;
        }
        const decodeValue = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodeValue || !decodeValue.user) {
            res.status(401).json({
                message: "loi stoken"
            });
            return;
        }
        req.user = decodeValue.user;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "loi dang nhap voi jwt"
        });
    }
};

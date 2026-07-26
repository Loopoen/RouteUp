"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rider_1 = require("../controller/rider");
const isAuth_1 = require("../middlewaves/isAuth");
const multer_1 = __importDefault(require("../middlewaves/multer"));
const router = express_1.default.Router();
router.get("/myProfile", isAuth_1.isAuth, rider_1.fetchMyProfile);
router.patch("/toggle", isAuth_1.isAuth, rider_1.toggleRiderAvailability);
router.post("/add", isAuth_1.isAuth, multer_1.default, rider_1.addRiderProfile);
exports.default = router;

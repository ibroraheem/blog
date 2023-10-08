import express from "express";
import { authorizeUser } from "../middlewares/authorize";
import * as user from "../controllers/user";


const router = express.Router();

router.post("/register", user.register);
router.post("/login", user.login);
router.post("/verify-otp", authorizeUser, user.verifyOTP);
router.post("/forgot-password", user.forgotPassword)
router.post("/reset-password", user.resetPassword)
export default router;

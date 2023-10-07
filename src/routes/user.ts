import express from "express";
import * as user from "../controllers/user";
import { authorizeUser } from "../middlewares/authorize";

const router = express.Router();

router.post("/register", user.register);
router.post("/login", user.login);
router.post("/verify-otp", authorizeUser, user.verifyOTP);

export default router;

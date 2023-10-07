"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.verifyOTP = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const mailService_1 = require("../utils/mailService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.secret;
const TOKEN_LIFESPAN = "1h";
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser)
            return res
                .status(400)
                .json({ message: `User ${username} already exists` });
        const otp = generateOTP();
        const expires = Date.now() + 60 * 60 * 10;
        const hashedPassword = yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = new user_1.default({
            username,
            email,
            password: hashedPassword,
            verificationOTP: otp,
            verificationOTPExpires: expires,
        });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: TOKEN_LIFESPAN });
        yield (0, mailService_1.sendMail)(email, "Welcome to Blog API", `Your OTP is: ${otp}`);
        return res.status(201).json({
            message: `User ${username} has successfully registered! OTP has been sent to your email. Please verify to complete registration.`,
            token,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error registering User" });
    }
});
exports.register = register;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    try {
        const user = yield user_1.default.findOne({ verificationOTP: otp });
        if (!user)
            return res.status(400).json({ message: "invalid OTP" });
        if (Date.now() < user.verificationOTPExpires)
            return res.status(400).json({ message: "OTP expired" });
        user.isVerified = true;
        user.verificationOTP = " ";
        user.verificationOTPExpires = 0;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: TOKEN_LIFESPAN });
        return res
            .status(200)
            .json({ message: "Email verified successfully", token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error verifying OTP" });
    }
});
exports.verifyOTP = verifyOTP;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body;
    try {
        const user = yield user_1.default.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user)
            return res.status(401).json({ message: "Invalid username or email" });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid password" });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: TOKEN_LIFESPAN });
        res
            .status(200)
            .json({ message: `${user.username} successfully logged in` });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error verifying OTP" });
    }
});
exports.login = login;

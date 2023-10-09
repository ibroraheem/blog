import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { sendMail } from "../utils/mailService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.secret as string;
const TOKEN_LIFESPAN = "1h";
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: `User ${username} already exists` });
    const otp = generateOTP();
    const expires = Date.now() + 60 * 60 * 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user: IUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationOTP: otp,
      verificationOTPExpires: expires,
    });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, isVerified: user.isVerified },
      JWT_SECRET,
      { expiresIn: TOKEN_LIFESPAN }
    );
    await sendMail(email, "Welcome to Blog API", `Your OTP is: ${otp}`);
    return res.status(201).json({
      message: `User ${username} has successfully registered! OTP has been sent to your email. Please verify to complete registration.`,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error registering User" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { otp } = req.body;
  try {
    const user = await User.findOne({ verificationOTP: otp });
    if (!user) return res.status(400).json({ message: "invalid OTP" });
    if (Date.now() < user.verificationOTPExpires)
      return res.status(400).json({ message: "OTP expired" });
    user.isVerified = true;
    user.verificationOTP = " ";
    user.verificationOTPExpires = 0;
    await user.save();
    const token = jwt.sign(
      { userId: user._id, isVerified: user.isVerified },
      JWT_SECRET,
      { expiresIn: TOKEN_LIFESPAN }
    );
    return res
      .status(200)
      .json({ message: "Email verified successfully", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user)
      return res.status(401).json({ message: "Invalid username or email" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });
    const token = jwt.sign(
      { userId: user._id, isVerified: user.isVerified },
      JWT_SECRET,
      { expiresIn: TOKEN_LIFESPAN }
    );
    res
      .status(200)
      .json({ message: `${user.username} successfully logged in`, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error Logging in" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No such user" });
    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 36000;
    await user.save();
    await sendMail(
      email,
      "Password Reset",
      `Your OTP is: ${otp}. <br> Epires in 10 minutes`
    );
    res.status(200).json({ message: "Password Reset OTP sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { passwordResetToken, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const user = await User.findOne({ resetPasswordToken: passwordResetToken });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (Date.now() < user.resetPasswordExpires)
      return res.status(400).json({ message: "OTP Expired" });
    user.password = hashedPassword;
    user.resetPasswordToken = " ";
    user.resetPasswordExpires = 0;
    await user.save();
    res.status(200).json({ message: "Successfully updated the password" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

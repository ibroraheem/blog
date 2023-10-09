import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
declare module "express" {
  export interface Request {
    user?: any; // You can be more specific with the type if needed
  }
}
const JWT_SECRET = process.env.secret as string;

export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied! No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = req.user = {
      id: decoded.userId,
      isVerified: decoded.isVerified,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Invalid token" });
  }
};

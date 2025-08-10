import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../../Models/user.js";
import JWTService from "../../services/JWTservice.js";
import ResponseDTO from "../../DTOs/responseDTO.js";
import UserDTO from "../../DTOs/userDTO.js";
import { AppError } from "../../middlewares/errorMiddleware.js";
import cleanReqBody from "../../helpers/sanitize.js";
dotenv.config();

const accessTokenService = new JWTService(
  process.env.ACCESS_TOKEN_SECRET,
  "15d"
);
const refreshTokenService = new JWTService(
  process.env.REFRESH_TOKEN_SECRET,
  "7d"
);

class AuthController {
  // Register new user
  static register = async (req, res, next) => {
    try {
      const { fullName, userName, email, password } = cleanReqBody(req.body);

      const existingUser = await User.findOne({
        $or: [{ email }, { userName }],
      });

      if (existingUser) {
        throw new AppError(
          "User already exists with this email or username",
          409
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        fullName,
        userName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      const payload = { id: newUser._id, email: newUser.email };

      const accessToken = accessTokenService.generateToken(payload);
      const refreshToken = refreshTokenService.generateToken(payload);

      const userDTO = new UserDTO(newUser);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json(
        ResponseDTO.success("User registered successfully", {
          user: userDTO,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      next(err);
    }
  };

  // Login existing user
  static login = async (req, res, next) => {
    try {
      const { emailOrUsername, password } = cleanReqBody(req.body);

      const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { userName: emailOrUsername }],
      });

      if (!user) throw new AppError("User not found", 401);
      if (!user.isActive) throw new AppError("Account is deactivated", 401);

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new AppError("Invalid credentials", 401);

      const payload = { id: user._id, email: user.email };
      const accessToken = accessTokenService.generateToken(payload);
      const refreshToken = refreshTokenService.generateToken(payload);

      const userDTO = new UserDTO(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json(
        ResponseDTO.success("Login successful", {
          user: userDTO,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      next(err);
    }
  };

  // Refresh JWT tokens
  static refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = cleanReqBody(req.body);

      if (!refreshToken) {
        throw new AppError("Refresh token required", 401);
      }

      const decoded = refreshTokenService.verifyToken(refreshToken);
      if (!decoded) throw new AppError("Invalid refresh token", 401);

      const user = await User.findById(decoded.id);
      if (!user?.isActive)
        throw new AppError("User not found or inactive", 401);

      const payload = { id: user._id, email: user.email };
      const newAccessToken = accessTokenService.generateToken(payload);
      const newRefreshToken = refreshTokenService.generateToken(payload);

      return res.json(
        ResponseDTO.success("Token refreshed", {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        })
      );
    } catch (err) {
      next(err);
    }
  };

  // me
  static verifyToken = async (req, res, next) => {
    try {
      const user = req.user;
      res.json({ status: "success", user });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;

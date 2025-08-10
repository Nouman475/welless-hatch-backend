import express from "express";
import AuthController from "../../controllers/mics/authController.js";
import checkAuth from "../../middlewares/authMiddleware.js";
const router = express.Router();

// Register route
router.post("/register", AuthController.register);

// Login route
router.post("/login", AuthController.login);

// Refresh token route
router.post("/refresh-token", AuthController.refreshToken);

// me
router.get("/me", checkAuth, AuthController.verifyToken);

export default router;

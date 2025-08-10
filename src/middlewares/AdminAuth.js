import jwt from "jsonwebtoken";
import User from "../Models/user.js";

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "Missing token" });

    const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(id);

    if (!user || user.role !== "admin")
      return res.status(403).json({ status: "error", message: "Admins only" });

    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({
        status: "error",
        message:
          err.name === "TokenExpiredError" ? "token_expired" : "Unauthorized",
      });
  }
};

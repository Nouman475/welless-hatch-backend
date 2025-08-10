const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.userId || decoded.id;
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          req.user = user;
        }
      }
    } catch (err) {
      console.warn("OptionalAuth: JWT verification failed:", err.message);
    }
  }

  next(); // Always continue, even if no user
};

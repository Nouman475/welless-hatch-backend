import jwt from "jsonwebtoken";

class JWTService {
  constructor(secret, expiresIn = "1h") {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      return null;
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

export default JWTService;

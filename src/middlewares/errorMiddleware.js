export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  static handleError(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    console.log("ErrorHandler:", err);

    res.status(statusCode).json({
      status: err.status || "error",
      message: message,
    });
  }
}

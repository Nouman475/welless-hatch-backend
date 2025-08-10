class ResponseDTO {
  constructor(status = "success", message = "", data = null) {
    this.status = status;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  static success(message = "Operation successful", data = null) {
    return new ResponseDTO("success", message, data);
  }

  static fail(message = "Something went wrong", data = null) {
    return new ResponseDTO("fail", message, data);
  }

  static error(message = "Server error", data = null) {
    return new ResponseDTO("error", message, data);
  }
}

export default ResponseDTO;

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  return /^\+?\d{1,16}$/.test(phone);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
};

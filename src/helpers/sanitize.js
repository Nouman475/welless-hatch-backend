import sanitizeHtml from "sanitize-html";
import _ from "lodash";

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }
  return value;
};

const cleanReqBody = (input) => {
  const cleanObj = {};

  const recursiveSanitize = (obj, target) => {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (["__proto__", "constructor", "prototype"].includes(key)) continue;

      const value = obj[key];

      if (_.isPlainObject(value)) {
        target[key] = {};
        recursiveSanitize(value, target[key]);
      } else if (Array.isArray(value)) {
        target[key] = value.map((item) =>
          _.isPlainObject(item) ? cleanReqBody(item) : sanitizeValue(item)
        );
      } else {
        target[key] = sanitizeValue(value);
      }
    }
  };

  recursiveSanitize(input, cleanObj);
  return cleanObj;
};

export default cleanReqBody;

const Validator = require("validator");

const { isEmail, equals, isEmpty, isAlphanumeric, isLength } = Validator;

const keyList = [
  "firstName",
  "lastName",
  "email",
  "password",
  "confirmPassword",
  "twitter",
  "instagram",
  "phone",
  "bankAccountNo",
  "stageName",
  "title",
  "artist",
  "genre",
  "artiste",
];

const valEmpty = (key, value, errorObj) => {
  if (isEmpty(value)) errorObj[key] = `field should not be empty`;
  return;
};

const _aggregateValues = (data) => {
  const newData = keyList.reduce(
    (acc, curr) => ({ ...acc, [curr]: data[curr] || "" }),
    {}
  );
  return newData;
};

const register = (data) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  } = _aggregateValues(data);
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  if (isEmpty(firstName))
    errors["firstName"] = "First Name field should not be empty";
  if (isEmpty(lastName))
    errors["lastName"] = "Last Name field should not be empty";
  if (!isAlphanumeric(password) || !isLength(password, { min: 6, max: 20 }))
    errors["password"] =
      "Password should be alphanumeric and length between 6 - 20";
  if (!equals(password, confirmPassword))
    errors["confirmPassword"] = "Passwords do not match";
  if (Object.keys(errors).length) return errors;
  return false;
};

const login = ({ email }) => {
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  if (Object.keys(errors).length) return errors;
  return false;
};

const completeProfile = (data) => {
  const errors = {};
  const {
    twitter,
    instagram,
    phone,
    bankAccountNo,
    stageName,
  } = _aggregateValues(data);

  if (!isEmpty(twitter) && !twitter.startsWith("@") && twitter.length)
    errors["twitter"] = "@ should be at the start of the input";
  if (!isEmpty(instagram) && !instagram.startsWith("@") && instagram.length)
    errors["instagram"] = "@ should be at the start of the input";
  if (!isLength(phone, { min: 11, max: 11 }))
    errors["phone"] =
      "Phone number should be in this format - 08030xxxxxx (11 digits)";
  if (!isEmpty(bankAccountNo) && !isLength(bankAccountNo, { min: 10, max: 10 }))
    errors["bankAccountNo"] = "Bank account number should be 10 digits";
  if (Object.keys(errors).length) return errors;
  return false;
};

const musicInfo = ({ title, artiste, genre }) => {
  //This validates release form on the add music page.
  const errors = {};
  //Loops through the object to check if any one is empty.
  Object.entries({ title, artiste, genre }).forEach(([key, value]) => {
    valEmpty(key, value, errors);
  });
  if (Object.keys(errors).length) return errors;
  return false;
};

const emailValidator = ({ email }) => {
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  if (Object.keys(errors).length) return errors;
  return false;
};

const passValidator = (data) => {
  const { password, confirmPassword } = _aggregateValues(data);
  const errors = {};
  if (!/(?=.*\d)(?=.*[a-zA-Z]).{6,20}/.test(password))
    errors["password"] =
      "Password should be alphanumeric and length between 6 - 20";
  if (!equals(password, confirmPassword))
    errors["confirmPassword"] = "Passwords do not match";
  if (Object.keys(errors).length) return errors;
  return false;
};

module.exports = {
  register,
  login,
  completeProfile,
  musicInfo,
  emailValidator,
  passValidator,
};

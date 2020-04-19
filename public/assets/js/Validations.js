const Validator = require("validator");

const { isEmail, equals, isEmpty, isAlphanumeric, isLength } = Validator;

const _valEmpty = (key, value, errorObj) => {
  if (isEmpty(value)) errorObj[key] = `field should not be empty`;
  return;
};

const _respond = (errors) => (Object.keys(errors).length ? errors : null);

const register = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) => {
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  if (isEmpty(firstName))
    errors["firstName"] = "First Name field should not be empty";
  if (isEmpty(lastName))
    errors["lastName"] = "Last Name field should not be empty";
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_@.#&+-]{6,20}$/.test(password))
    errors["password"] =
      "Password contain alphabets, numbers and length between 6 - 20 (special characters like: _@.#&+- are accepted)";
  if (!equals(password, confirmPassword))
    errors["confirmPassword"] = "Passwords do not match";
  return _respond(errors);
};

const login = ({ email }) => {
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  return _respond(errors);
};

const completeProfile = (data) => {
  const errors = {};
  const {
    twitter = "",
    instagram = "",
    phone,
    bankAccountNo = "",
    stageName,
  } = data;
  Object.entries({ stageName }).forEach(([key, value]) => {
    _valEmpty(key, value, errors);
  });
  if (!isEmpty(twitter) && !twitter.startsWith("@"))
    errors["twitter"] = "@ should be at the start of the input";
  if (!isEmpty(instagram) && !instagram.startsWith("@"))
    errors["instagram"] = "@ should be at the start of the input";
  if (!isLength(phone, { min: 11, max: 11 }))
    errors["phone"] =
      "Phone number should be in this format - 08030xxxxxx (11 digits)";
  if (!isEmpty(bankAccountNo) && !isLength(bankAccountNo, { min: 10, max: 10 }))
    errors["bankAccountNo"] = "Bank account number should be 10 digits";
  return _respond(errors);
};

const musicInfo = ({ title, artiste, genre }) => {
  //This validates release form on the add music page.
  const errors = {};
  //Loops through the object to check if any one is empty.
  Object.entries({ title, artiste, genre }).forEach(([key, value]) => {
    _valEmpty(key, value, errors);
  });
  return _respond(errors);
};

const emailValidator = ({ email }) => {
  const errors = {};
  if (!isEmail(email)) errors["email"] = "This is not a valid email address";
  return _respond(errors);
};

const passValidator = ({ password, confirmPassword }) => {
  const errors = {};
  if (!/(?=.*\d)(?=.*[a-zA-Z]).{6,20}/.test(password))
    errors["password"] =
      "Password should be alphanumeric and length between 6 - 20";
  if (!equals(password, confirmPassword))
    errors["confirmPassword"] = "Passwords do not match";
  return _respond(errors);
};

const validateReleaseDate = ({ releaseDate }) => {
  const errors = {};
  if (isEmpty(releaseDate))
    errors["releaseDate"] = "Release date cannot be empty";
  return _respond(errors);
};

const validateAlbumForm = ({ title, artwork }) => {
  const errors = {};
  if (isEmpty(title)) errors["releaseDate"] = "Title cannot be empty";
  if (isEmpty(artwork))
    errors["releaseDate"] = "You have to select an image for your album";
  return _respond(errors);
};

module.exports = {
  register,
  login,
  completeProfile,
  musicInfo,
  emailValidator,
  passValidator,
  validateReleaseDate,
};

const valExtractor = require("../util/valExtractor");
const setStoreIf = ({ getStore, setStore }) => (
  key,
  value,
  destinationKey,
  destinationValue,
  containerKey
) => {
  //checks if key is a string
  if (typeof key === "string") key = [key];
  //Extracts the value of the key from store
  let keyValue = valExtractor(getStore(), key);
  //If the key isnt found in the store throw an error
  if (keyValue === undefined) throw new Error("SETSTOREIF: keyValue not found");
  //Checks if the value to be compared with is an array
  if (Array.isArray(value)) {
    //extracts the value from the store, using the value as the key
    value = valExtractor(getStore(), key);
  }
  let status;
  //checks to see if the type of keyValue is an object which might be an array or an object
  if (typeof keyValue === "object") {
    //If its an array check if its empty by checking for the length and comparing the boolean value to the boolean value of the value being compared with
    if (Array.isArray(keyValue))
      status = Boolean(keyValue.length) === Boolean(value);
    //converts the object to an array and do the same checking
    else status = Boolean(Object.keys(keyValue).length) === Boolean(value);
    //the else after this block executes if this doesn't, which means its a primitive value.
  } else status = keyValue === value;
  //returns if the comparison fails
  if (status === false) return;
  //Checks if the destination value is an array, gets the value by extracting it from the store
  if (Array.isArray(destinationValue))
    destinationValue = valExtractor(getStore(), destinationValue);
  //If there is a container key, it sets the key, value pair under it else, it stores the key, value pair in the store directly
  if (containerKey)
    return setStore(containerKey, { [destinationKey]: destinationValue });
  return setStore(destinationKey, destinationValue);
};

module.exports = { setStoreIf };

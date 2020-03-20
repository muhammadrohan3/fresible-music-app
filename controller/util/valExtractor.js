module.exports = (obj, keyRoute) => {
  let resultVal;
  keyRoute.forEach(route => {
    if (!resultVal) resultVal = obj[route];
    else resultVal = resultVal[route];
  });
  return resultVal;
};

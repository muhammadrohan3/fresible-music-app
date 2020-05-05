const pubSub = (() => {
  const Subjects = {};

  const _generateRandomTokens = () =>
    new Array(10)
      .fill(0)
      .map(() => Math.random() * 8)
      .join("");

  const subscribe = (subject, callback, callbackContext) => {
    const token = _generateRandomTokens();
    if (Subjects[subject]) {
      Subjects[subject].push({ token, callback });
    } else {
      Subjects[subject] = [{ token, callback, callbackContext }];
    }
    return token;
  };

  const unsubscribe = (subject, token) => {
    if (!Subjects[subject]) return false;
    Subjects[subject] = Subjects[subject].filter(
      (listener) => listener.token !== token
    );
    return true;
  };

  const publish = (subject, args = [], context = null) => {
    if (!Subjects[subject]) return false;
    Subjects[subject].forEach(({ callback, callbackContext }) =>
      callback.apply(context || callbackContext, args)
    );
    return true;
  };

  return { publish, subscribe, unsubscribe };
})();

export default pubSub;

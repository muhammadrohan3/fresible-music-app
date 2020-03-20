// COOKIESETTER
const cookieSetter = ({ setStore, getStore, res }) => (
  name,
  toExpire,
  route
) => {
  const { cookieKey } = getStore();
  if (!cookieKey) return;
  const [key, value] = Object.entries(cookieKey)[0];
  res.cookie(name || key, value, {
    maxAge: toExpire || 24 * 60 * 60 * 1000,
    path: route || "/"
  });
  return setStore("COOKIESET", true);
};

//COOKIECLEARER
const cookieClearer = ({ res, setStore }) => (name, all) => {
  res.clearCookie(name);
  return setStore("cookieClearer", "done");
};

module.exports = { cookieClearer, cookieSetter };

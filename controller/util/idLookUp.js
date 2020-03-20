module.exports = (num, status) => {
  num = parseInt(num);
  if (isNaN(num)) return;
  const start = 42351;
  if (status || num > start) return num - start;
  return start + num;
};

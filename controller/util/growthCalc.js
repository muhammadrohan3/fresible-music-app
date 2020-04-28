const growthCalc = (current, previous) => {
  if (current === 0 || previous === 0) return [null, null];
  let rate = ((current - previous) / previous) * 100;
  rate = Math.round(rate * 100) / 100;
  if (rate === 0) return [null, null];
  return [rate, rate > 0];
};

module.exports = growthCalc;

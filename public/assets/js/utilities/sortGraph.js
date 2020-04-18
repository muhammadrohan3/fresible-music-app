export default (datasets = []) => {
  const _sum = (numbers) => numbers.reduce((acc, cur) => acc + cur, 0);
  return datasets.sort((a, b) => _sum(a.data) - _sum(b.data));
};

const growthCalc = require("../../util/growthCalc");

module.exports = ({
  CurrentDataHash,
  PreviousDataHash,
  CountKeys = ["count"],
  ChartDataHash = false,
  Colors = {},
}) => {
  const prepare = (CurrentDataHash, PreviousDataHash = {}) => {
    const list = Object.entries(CurrentDataHash).map(([id, data]) => {
      const { children, level } = data;
      const previousData = PreviousDataHash[id] || {};
      //Set the color to the corresponding Chart color for the dataset;
      if (level === 1 && ChartDataHash && ChartDataHash[id]) {
        data["color"] = Colors[ChartDataHash[id]["colorId"]].borderColor;
      }
      CountKeys.forEach((countKey) => {
        const [rate, growing] = growthCalc(
          data[countKey],
          previousData[countKey]
        );
        data[countKey] = { count: data[countKey], rate, growing };
      });
      if (children)
        data["children"] = prepare(children, previousData["children"]);
      return data;
    });
    return list;
  };
  return prepare(CurrentDataHash, PreviousDataHash);
};

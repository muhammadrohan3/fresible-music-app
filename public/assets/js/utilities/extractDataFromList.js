export default (list, graph) => {
  //graph example --> graph = [['package', 'id], ['subscription', 'id']]
  //list is an array of data.
  //loops through the list of data, returns an array of this form [[value1, ..., value_n], ..., length of list]
  return list.reduce((acc, curr) => {
    //Loops through each graph item called routes or paths
    const valueList = graph.map(graphItems => {
      let resultVal;
      //Loops through each route item, follows it to the last item and returns the value
      graphItems.forEach(
        route => (resultVal = !resultVal ? curr[route] : resultVal[route])
      );
      return resultVal;
    });
    return [...acc, valueList];
  }, []);
};

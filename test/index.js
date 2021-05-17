const api = require("logicle-js");

console.log(api.LogicleTransform([1, 2, 3], 262144, 4.5, 0, 0));
console.log(api.FastLogicleTransform([1, 2, 3], 262144, 4.5, 0, 0));
console.log(api.HyperlogTransform([1, 2, 3], 262144, 4.5, 1, 0));

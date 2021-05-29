const fs = require("fs-extra")
const data = fs.readJSONSync("cd4.json");
const TRANS = require("logicle-trans");
const microbenchmark = require("nodemark");

const res = microbenchmark(() => {TRANS.LogicleTransform(data.data, T = 262144, M = 4.5, W = 1, A = 1)});
console.log("Mean runtime:", res.milliseconds(), "milliseconds");

const data_scale = TRANS.LogicleTransform(data.data, 262144, 4.5, 1, 1, false)
console.log(data_scale);
fs.writeJSONSync("cd4-node.json", {data: data_scale}, )


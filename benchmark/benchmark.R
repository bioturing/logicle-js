library(flowCore)
library(microbenchmark)
library(jsonlite)

fs <- read.FCS("/Volumes/Samsung_T5/FlowJo/LD1_NS+NS_A01_exp.fcs")
logicle.trans <- logicleTransform(w = 1, a = 1, t = 262144, m = 4.5)
hyperlog.trans <- hyperlog()
fast.logicle.trans <- logicleTransform()
cd4 <- fs@exprs[, 12]
jsonlite::write_json(list(data=cd4), "cd4.json")
cd4.scaled.R <- logicle.trans(cd4)

microbenchmark(logicle.trans(cd4), times = 100)


cd4.scaled.node <- jsonlite::fromJSON("cd4-node.json")
sum(abs(cd4.scaled.node$data - cd4.scaled.R/4.5)) / 250342
mean(cd4.scaled.R/4.5)

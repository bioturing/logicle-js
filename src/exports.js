const api = require("./build/Release/logicle.node");

exports.LogicleTransform = function(x, T=262144, M=4.5, W=0, A=0, inverse=0) {
    return api.logicle_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

exports.FastLogicleTransform = function(x, T=262144, M=4.5, W=0, A=0, inverse=0) {
    return api.fast_logicle_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

exports.HyperlogTransform = function(x, T=262144, M=4.5, W=0, A=0, inverse=0) {
    return api.hyperlog_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

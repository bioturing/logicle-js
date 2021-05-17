const api = require("./build/Release/logicle.node");

exports.LogicleTransform = function(x, T, M, W, A, inverse) {
    if (x == null)
        throw "x is not specified";
    if (T == null)
        throw "T is not specified";
    if (M == null)
        throw "M is not specified";
    if (W == null)
        throw "W is not specified";
    if (A == null)
        throw "A is not specified";
    if (inverse == null)
        inverse = false;

    return api.logicle_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

exports.FastLogicleTransform = function(x, T, M, W, A, inverse) {
    if (x == null)
        throw "x is not specified";
    if (T == null)
        throw "T is not specified";
    if (M == null)
        throw "M is not specified";
    if (W == null)
        throw "W is not specified";
    if (A == null)
        throw "A is not specified";
    if (inverse == null)
        inverse = false;

    return api.fast_logicle_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

exports.HyperlogTransform = function(x, T, M, W, A, inverse) {
    if (x == null)
        throw "x is not specified";
    if (T == null)
        throw "T is not specified";
    if (M == null)
        throw "M is not specified";
    if (W == null)
        throw "W is not specified";
    if (A == null)
        throw "A is not specified";
    if (inverse == null)
        inverse = false;

    return api.hyperlog_transform({
        x:x,
        T:T,
        M:M,
        W:W,
        A:A,
        inverse:inverse
    });
};

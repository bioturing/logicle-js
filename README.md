# logicle-js
Logicle transformation implemented in Javascript

# Installation
npm install logicle-trans

# Usage
```javascript
const api = require("logicle-trans");
// Available functions:
// LogicleTransform = function(x, T, M, W, A, inverse=false);
// FastLogicleTransform = function(x, T, M, W, A, inverse=false);
// HyperlogTransform = function(x, T, M, W, A, inverse=false);
api.LogicleTransform([3, 1.4, 7,2, 1000], 262144, 4.5, 0, 0);
```

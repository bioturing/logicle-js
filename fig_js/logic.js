// import * as echarts from 'echarts';
// import * as d3 from 'd3';


//const paper = require("paper");
var ROOT_PATH = 'http://127.0.0.1:8099/';

var chartDom = document.getElementById('chart');
const canvas = document.createElement("canvas");
canvas.width = 1080;
canvas.height = 900;
const tickPadding = 50;

let padding = 100;
const trimQuantile = [0, 1];

const findMaxMinQuantiled = function(items, index) {
    const n = items.length;
    const data = new Float32Array(n);
    for (let i = 0; i < n; ++i) {
        data[i] = items[i][index]; 
    }
    data.sort();
    return [data[Math.round(trimQuantile[0] * n)], data[Math.min(n - 1, Math.round(trimQuantile[1] * n))]]
}

const findMinMaxY = function(items) {
    return findMaxMinQuantiled(items, 1) 
}

const findMinMaxX = function(items) {
    return findMaxMinQuantiled(items, 0) 
}

class BinningSquare {
    constructor(nBins) {
        this.n = nBins;
        this.dens = {}; // key: bin Number, value: count
        this.dataInv = {} // key: bin number, value: [item1, item2, ...]
        this.spectralColors = [
            '#3288bd', 
            '#66c2a5', 
            '#abdda4', 
            '#e6f598', 
            '#ffffbf',
            '#fee08b',
            '#fdae61',
            '#f46d43',
            '#d53e4f']
        this.r = 10000;
    }
    computeBinW(minmaxX, minmaxY) {
        this.minmaxX = minmaxX;
        this.minmaxY = minmaxY;
        const rangeX = minmaxX[1] - minmaxX[0];
        const rangeY = minmaxY[1] - minmaxY[0];
        this.binWX = rangeX / this.n;
        this.binWY = rangeY / this.n;
        console.log("binwidth", this.binWX, this.binWY, rangeX, rangeY);
    }
    
    getBin(datum) {
        const ix = Math.round((datum[0] - this.minmaxX[0]) / this.binWX);
        const iy = Math.round((datum[1] - this.minmaxY[0]) / this.binWY);
        const k = ix * this.r + iy;
        if (!isFinite(k)) {
          console.log(datum, "Infinity ERRROROROROROROROOROR"); 
        }
        return k;
    }

    // add one datum with index is optional
    addData(datum, idx = -1) {
        const k = this.getBin(datum);
        this.dens[k] = this.dens[k] === undefined ? 1 : this.dens[k] + 1;
        if (this.dataInv[k] === undefined) {
            this.dataInv[k] = [idx];
        } else {
            this.dataInv[k].push(idx);
        }
    }

    decodeBin(binNumber) {
        return {
            x: Math.round(binNumber / this.r),
            y: binNumber % this.r
        }
    }

    getDatum2DfromBins() {
        let dataB = [];
        for (let o in this.dens) {
            const pos = this.decodeBin(o);
            if  (isNaN(pos.x) || isNaN(pos.y)) {
              console.log("ERRRORORORO", o);
            }
            dataB.push([pos.x, pos.y]);
        }
        return dataB;
    }


    getColorHexfromBins() {
        const colorB = [];
        for (let o in this.dens) {
            const color = this.getColorOfBin(o);
            colorB.push(color);
        }
        return colorB;
    }

    getColorOfBin(bin) {
        const cnt = this.dens[bin] === undefined ? 0 : this.dens[bin]; 
        return this.getColorofCnt(cnt);
    }

    getCnt(datum) {
        const k = this.getBin(datum);
        const cnt = this.dens[k] === undefined ? 0 : this.dens[k];
        return cnt;
    }

    getAllCnts() {
        let dataArray = [];
        for(let o in this.dens) {
            dataArray.push(parseInt(this.dens[o]));
        }
        dataArray.sort((a, b) => a - b);
        this.allCnt = dataArray;
    }

    computeQuantile() {
        const n = this.allCnt.length;
        console.log("n valid bins", n);
        // not ideal
        const max = this.allCnt[Math.min(Math.round(n * 0.99), n - 1)];
        const min = this.allCnt[Math.round(n * 0.01)];
        this.quantiles = [min];
        for(let i = 0; i < 8; i++) {
            this.quantiles.push(min + (max - min) / (9 - i));
        }
        console.log("quantile", this.quantiles);
    }

    finishAddingData() {
        this.getAllCnts();
        this.computeQuantile();
    }

    getColorofCnt(cnt) {
        // TODO: check quantile array
        for (let i = 1; i < this.quantiles.length; i++) {
            if (cnt < this.quantiles[i]) {
                return this.spectralColors[i - 1];
            }
        }
        return this.spectralColors[this.quantiles.length - 1];
    }

    getColor(datum) {
        const cnt = this.getCnt(datum);
        return this.getColorofCnt(cnt); 
    }
}

/*
    draw axis pipeline 
    const canvas = document.getElementById("coolCanvas")

    AxisDecarts.setUpCanvas(canvas);
    const yaxis = new YAxisDecarts("y", canvas, 30);

    const xaxis = new XAxisDecarts("x", canvas, 30);

    const ticks = [[50, 5], [100, 10], [150, 15], [200, 20]];
*/
class AxisDecarts {
    constructor(name, width, height, padding) {
      this.name = name;
      this.width = width;
      this.height = height;
      this.tickLabels = []; //[label, absolute pos]
      this.tickMarks = []; // [absolute pos]
      this.padding = padding;
    }
  
    static setUpCanvas(canvas) {
      paper.setup(canvas);
      paper.view.draw();
    }
  
    drawVticks(tick) {
      const x = tick[0]; // assume this is decade
      let text = tick[1];
      
      const src_y = this.height - this.padding;
      const dest_y = src_y + 5;
      const t = new paper.Path.Line(new paper.Point([x, src_y]),
        new paper.Point([x, dest_y]))
      const pt = new paper.PointText(new paper.Point([x, dest_y + 10]))
      pt.justification = "left";
      pt.fillColor = "black";
      pt.content = text;
      pt.fontSize = 14;
      t.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
      t.data = {
        type: "vtick"
      }
    }
    drawHticks(tick) {
      let text = tick[1];
      
      const y = this.height - tick[0] // because of paper.js coords
      const src_x = this.padding;
      const dest_x = src_x - 5;
      const t = new paper.Path.Line(new paper.Point([src_x, y]),
        new paper.Point([dest_x, y]))
  
      const pt = new paper.PointText(new paper.Point([dest_x - 1, y]))
      pt.justification = "right";
      pt.fillColor = "black";
      pt.content = text;
      pt.fontSize = 14;
      t.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
      t.data = {
        type: "vtick"
      }
    }
  }
  
  class XAxisDecarts extends AxisDecarts {
    constructor(name, width, height, padding) {
      super(name, width, height, padding);
      this.drawLine();
      this.drawName();
    }
    drawName() {
        const pt = new paper.PointText(new paper.Point([this.width / 2, this.height - this.padding + tickPadding])) 
        pt.justification = "center";
        pt.fillColor = "black";
        pt.content = this.name;
        pt.fontSize = 20;
    }
    drawLine() {
      this.src = new paper.Point([this.padding, this.height - this.padding]);
      this.dest = new paper.Point([this.width - this.padding, this.height - this.padding]);
      this.axis = new paper.Path.Line(this.src, this.dest);
      this.axis.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
      this.axistop = new paper.Path.Line(new paper.Point([this.padding, this.padding]),
                                         new paper.Point([this.width - this.padding, this.padding]));
      this.axistop.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
    }
    // ticklabels = [[tick, pos], ...]
    setTickLabels(ticklabels) {
      for (let i = 0; i < ticklabels.length; i++) {
        this.drawVticks(ticklabels[i]);
      }
    }
  }
  
  
  class YAxisDecarts extends AxisDecarts {
    constructor(name, width, height, padding) {
      super(name, width, height, padding);
      this.drawLine();
      this.drawName();
  
    }
    drawName() {
        const pt = new paper.PointText(new paper.Point([this.padding - tickPadding, this.height / 2])) 
        pt.justification = "center";
        pt.fillColor = "black";
        pt.content = this.name;
        pt.fontSize = 20;
        pt.rotate(-90);
    }
    drawLine() {
      this.src = new paper.Point([this.padding, this.padding]);
      this.dest = new paper.Point([this.padding, this.height - this.padding]);
      this.axis = new paper.Path.Line(this.src, this.dest);
      this.axis.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
      this.axisright = new paper.Path.Line(new paper.Point([this.width - this.padding, this.padding]),
                                         new paper.Point([this.width - this.padding, this.height - this.padding]));
      this.axisright.style = {
        strokeColor: "black",
        strokeWidth: 2
      }
    }
    // ticklabels = [[pos, tick], ...]
    setTickLabels(ticklabels) {
      for (let i = 0; i < ticklabels.length; i++) {
        this.drawHticks(ticklabels[i]);
      }
    }
  }

/* Scale your 2D data points to a pre-defined rectangle */
const scaleDataToRect = function(data, width, height, padding) {
    const minmaxY = findMinMaxY(data);
    const minmaxX = findMinMaxX(data);
    const w = width - padding;
    const h = height - padding;
    // also calibrate the data to "max" and "min" values
    const dataS = data.slice();
    for (let i = 0; i < dataS.length; ++i) {
      dataS[i][0] = ((dataS[i][0] - minmaxX[0]) / (minmaxX[1] - minmaxX[0])) * (w - padding);
      dataS[i][0] = Math.max(0, dataS[i][0]);
      dataS[i][0] = Math.min(w, dataS[i][0]);
      dataS[i][1] = ((dataS[i][1] - minmaxY[0]) / (minmaxY[1] - minmaxY[0])) * (h - padding);
      dataS[i][1] = Math.max(0, dataS[i][1]);
      dataS[i][1] = Math.min(h, dataS[i][1]);
      dataS[i][0] += padding;
      dataS[i][1] += padding;
    }
    return dataS;
}

const doJob = function(data) {
    const breaks = [1.268484 ,1.428402 ,1.603076 ,2.221025 ,2.490970 ,3.086268 ,3.335929];
    const labels = ["10", "50", "1e2", "500", "1e3", "5000", "1e4"];

    const generateXTicks = function(max) {
        const decades = [];
        for (let i = 0; i < labels.length; ++i) {
          if ( breaks[i] > max || breaks[i] < mmX[0])
            continue;
            const d = [breaks[i], labels[i]];
          d[0] = Math.round((d[0] - mmX[0]) / binning.binWX); //assume binning
          d[0] = d[0] / binning.n * (this.width - 2 * padding) + padding; // scale to rectangle with padding
          decades.push(d);
        }
        console.log("Xticks", decades);
        return decades;
      }
      const generateYTicks = function(max) {
        const decades = [];
        for (let i = 0; i < labels.length; ++i) {
            if ( breaks[i] > max || breaks[i] < mmY[0])
            continue;
            const d = [breaks[i], labels[i]];
          d[0] = Math.round((d[0] - mmY[0]) / binning.binWY); //assume binning
          d[0] = d[0] / binning.n * (this.height - 2 * padding) + padding; // scale to rectangle with padding
          decades.push(d);
        }
        return decades;
      }

    const salt = function() {
        return ((0.5 - Math.random()) * 0.001) 
    }

    const addAxis = function() {
        const xaxis = new XAxisDecarts("CD4", this.width, this.height, padding);
        const yaxis = new YAxisDecarts("CD8", this.width, this.height, padding);
        const xticks = generateXTicks(mmX[1]);
        const yticks = generateYTicks(mmY[1]);
        xaxis.setTickLabels(xticks);
        yaxis.setTickLabels(yticks);
    }

    const addTitle = function(title) {
        const pt = new paper.PointText(new paper.Point([padding, padding - 20])) 
        pt.justification = "left";
        pt.fillColor = "black";
        pt.content = title;
        pt.fontSize = 24;
    }
    const drawScatter = function() {
       paper.setup(canvas);
       this.width = canvas.width;
       this.height = canvas.height;
       paper.view.draw();
       let dataB = binning.getDatum2DfromBins();
       const dataS = scaleDataToRect(dataB, this.width, this.height, padding);
       const colors = binning.getColorHexfromBins();
       for (let i = 0; i < dataS.length; ++i) {
           const d = dataS[i];
           const c = new paper.Path.Circle({
               center : [d[0] , this.height- d[1] ] , //the point (0, 0) is at the top left corner of the plot
               radius: 0.8,
               fillColor: colors[i]
           })
       }
       addAxis();
       addTitle("Data scaled by LogicleTransform in logicle-trans");
    }
    mmX = findMinMaxX(data);
    const mmY = findMinMaxY(data);
    const binning = binningData(data, mmX, mmY);
    drawScatter();
}

const binningData = function(data, mmX, mmY) {
    const binning = new BinningSquare(500);
    binning.computeBinW(mmX, mmY);
    data.forEach((datum, i) => {
        binning.addData(datum, -1);
    });
    binning.finishAddingData();
    return binning;
}
function download(filename) {
    var element = document.createElement('a');
    const d = canvas.toDataURL('image/png')
    console.log(d);
    element.setAttribute('href', canvas.toDataURL('image/png'));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }


$.getJSON(ROOT_PATH + 'cd4.json', function (data) {
    doJob(data);
    chartDom.append(canvas);
});
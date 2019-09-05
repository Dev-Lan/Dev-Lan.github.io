import { FileLoadUtil } from './FileLoadUtil';
import { BoxPlotData } from './BoxPlotData';
import { BoxPlotViz } from './BoxPlotViz';
import * as d3 from 'd3';

// console.log(sayHello('TypeScript'));

let fileInputElement: HTMLElement = document.getElementById("fileLoadInput");
let boxPlotViz = new BoxPlotViz();
let boxPlotProcessor = new BoxPlotData((data: BoxPlotData, filename: string) => { boxPlotViz.OnDataLoaded(data, filename)});
let fileLoader: FileLoadUtil = new FileLoadUtil((rawValues: d3.DSVRowArray<string>, filename: string) => { boxPlotProcessor.Initialize(rawValues, filename) });
fileInputElement.onchange = (ev: Event) => fileLoader.OpenFile(ev)

// window.onresize = reportWindowSize;

window.onresize = () => { boxPlotViz.BuildDomGraph(); }
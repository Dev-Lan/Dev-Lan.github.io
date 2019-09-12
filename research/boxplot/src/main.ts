import { FileLoadUtil } from './FileLoadUtil';
import { BoxPlotData } from './BoxPlotData';
import { BoxPlotViz } from './BoxPlotViz';
import * as d3 from 'd3';


let fileInputElement: HTMLElement = document.getElementById("fileLoadInput");
let boxPlotViz = new BoxPlotViz();
let boxPlotProcessor = new BoxPlotData((data: BoxPlotData, filename: string) => { boxPlotViz.OnDataLoaded(data, filename)});
let fileLoadedCallback = (rawValues: d3.DSVRowArray<string>, filename: string) => { boxPlotProcessor.Initialize(rawValues, filename) }
let fileLoader: FileLoadUtil = new FileLoadUtil(fileLoadedCallback);
fileInputElement.onchange = (ev: Event) => fileLoader.OpenFile(ev)

window.onresize = () => { boxPlotViz.BuildDomGraph(); }
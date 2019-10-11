import { FileLoadUtil } from '../../lib/FileLoadUtil';
import { BoxPlotData } from './BoxPlotData';
import { BoxPlotViz } from './BoxPlotViz';
import { DevlibMath } from '../../lib/DevlibMath';

import * as d3 from 'd3';


let fileInputElement: HTMLElement = document.getElementById("fileLoadInput");
let boxPlotViz = new BoxPlotViz();
let preloadFunction = () => { boxPlotViz.OnPreDataLoad(); }
let dataLoadedFunction = (data: BoxPlotData, filename: string) => { boxPlotViz.OnDataLoaded(data, filename)}
let boxPlotData = new BoxPlotData(preloadFunction, dataLoadedFunction);
let fileLoadedCallback = (rawValues: string, filename: string) => { boxPlotData.Initialize(rawValues, filename) }
let fileLoader: FileLoadUtil = new FileLoadUtil(fileLoadedCallback);
fileInputElement.onchange = (ev: Event) => fileLoader.OpenFile(ev)

window.onresize = () => { boxPlotViz.BuildDomGraph(); }

export function getBoxPlotData()
{
	return boxPlotData;
}

export function getMathLib()
{
	return DevlibMath;
}
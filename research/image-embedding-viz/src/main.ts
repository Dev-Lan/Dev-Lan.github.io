import * as d3 from 'd3';
import { ScatterPlotWithImage } from './ScatterPlotWithImage'
import { ImageDetails } from './ImageDetails'
import { pointWithImage } from './types';

let scatterPlot: ScatterPlotWithImage;
let imageDetails: ImageDetails;

const baseFolder = "https://raw.githubusercontent.com/Dev-Lan/image-embedding-data/master/";
const exampleFolder = baseFolder + "dots/";
d3.json(exampleFolder + 'pointList.json').then(data =>
{
	console.log(data)
	scatterPlot = new ScatterPlotWithImage("scatterPlot", data, onBrushSelectionChange);
	scatterPlot.draw();
});

d3.json(exampleFolder + 'imageLookup.json').then(data =>
{
	console.log(data)
	imageDetails = new ImageDetails("imageDetails", data, exampleFolder + 'tiledImg.png');
});


function onBrushSelectionChange(data: pointWithImage[]): void
{
	scatterPlot.onBrushSelectionChange(data);
	imageDetails.onBrushSelectionChange(data);
}
import * as d3 from 'd3';
import { ScatterPlotWithImage } from './ScatterPlotWithImage'
import { ImageDetails } from './ImageDetails'
import { pointWithImage } from './types';

let scatterPlot: ScatterPlotWithImage;
let imageDetails: ImageDetails;

d3.json('../data/pointList.json').then(data =>
{
	scatterPlot = new ScatterPlotWithImage("scatterPlot", data, onBrushSelectionChange);
	scatterPlot.draw();
});

d3.json('../data/imageLookup.json').then(data =>
{
	imageDetails = new ImageDetails("imageDetails", data);
});


function onBrushSelectionChange(data: pointWithImage[]): void
{
	scatterPlot.onBrushSelectionChange(data);
	imageDetails.onBrushSelectionChange(data);
}
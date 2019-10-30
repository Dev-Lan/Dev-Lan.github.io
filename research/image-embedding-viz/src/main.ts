import * as d3 from 'd3';
import { ScatterPlotWithImage } from './ScatterPlotWithImage'
import { ImageDetails } from './ImageDetails'
import { DatasetSelector, DatasetAttributes} from './DatasetSelector';
import { pointWithImage } from './types';

let scatterPlot: ScatterPlotWithImage = new ScatterPlotWithImage("scatterPlot", onBrushSelectionChange);
let imageDetails: ImageDetails = new ImageDetails("imageDetails");
let dataSelector: DatasetSelector;

// const baseFolder = "https://raw.githubusercontent.com/Dev-Lan/image-embedding-data/master/";
const baseFolder = "../myData/image-embedding-data/";
const exampleFolder = baseFolder + "truss/";

d3.json(baseFolder + 'examples.json').then(data =>
{
	dataSelector = new DatasetSelector("examplesContainer", data, onDatasetChange);
});


function onDatasetChange(dataAttr: DatasetAttributes): void
{
	let dataFolder = baseFolder + dataAttr.folderName;
	if (dataFolder[dataFolder.length - 1] !== "/")
	{
		dataFolder += "/";
	}
	console.log(dataAttr);
	const firstProjection = dataAttr.projectionList[0].filename;
	d3.json(dataFolder + firstProjection).then(data =>
	{
		scatterPlot.onDataChange(data);
	});

	d3.json(dataFolder + 'imageLookup.json').then(data =>
	{
		imageDetails.onDataChange(data, dataFolder + "tiledImg.png");
	});
}


function onBrushSelectionChange(data: pointWithImage[]): void
{
	scatterPlot.onBrushSelectionChange(data);
	imageDetails.onBrushSelectionChange(data);
}
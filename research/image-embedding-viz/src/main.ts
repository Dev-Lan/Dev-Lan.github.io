import * as d3 from 'd3';
import { ScatterPlotWithImage } from './ScatterPlotWithImage'
import { ImageDetails } from './ImageDetails'
import { DatasetSelector, DatasetAttributes, ProjectionAttributes} from './DatasetSelector';
import { pointWithImage } from './types';

let scatterPlot: ScatterPlotWithImage = new ScatterPlotWithImage("scatterPlot", onBrushSelectionChange);
let imageDetails: ImageDetails = new ImageDetails("imageDetails");
let dataSelector: DatasetSelector;

const baseFolder = "https://raw.githubusercontent.com/Dev-Lan/image-embedding-data/master/";
// const baseFolder = "../myData/image-embedding-data/";
const exampleFolder = baseFolder + "truss/";

d3.json(baseFolder + 'examples.json').then(data =>
{
	dataSelector = new DatasetSelector("examplesContainer", "projectionSelectContainer", data, onDatasetChange);
});


function onDatasetChange(dataAttr: DatasetAttributes, projAttr?: ProjectionAttributes): void
{
	let dataFolder = baseFolder + dataAttr.folderName;
	if (dataFolder[dataFolder.length - 1] !== "/")
	{
		dataFolder += "/";
	}
	console.log(dataAttr);
	let projectionSwitchOnly = true;
	if (!projAttr)
	{
		projAttr = dataAttr.projectionList[0];
		projectionSwitchOnly = false;
	}
	d3.json(dataFolder + projAttr.filename).then(data =>
	{
		console.log(data);
		scatterPlot.onDataChange(data, projectionSwitchOnly);
	});

	d3.json(dataFolder + 'imageLookup.json').then(data =>
	{
		imageDetails.onDataChange(data, dataFolder + "tiledImg.png", dataAttr.imageWidth, dataAttr.imageHeight, projectionSwitchOnly);
	});
}


function onBrushSelectionChange(data: pointWithImage[]): void
{
	scatterPlot.onBrushSelectionChange(data);
	imageDetails.onBrushSelectionChange(data);
}

window.onresize = () => { 
	scatterPlot.onWindowResize();
	imageDetails.onBrushSelectionChange([]);
}

window.onkeydown = (ev: KeyboardEvent) =>
{
	if (ev.shiftKey)
	{
		scatterPlot.onShiftKeyDown();
	}
}

window.onkeyup = (ev: KeyboardEvent) =>
{
	if (!ev.shiftKey)
	{
		scatterPlot.onShiftKeyUp();
	}
}

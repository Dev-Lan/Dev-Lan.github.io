import * as d3 from 'd3';
import { ScatterPlotWithImage } from './ScatterPlotWithImage';
import { ImageDetails } from './ImageDetails';
import { AttributeData } from './AttributeData';
import { DatasetSelector, DatasetAttributes, ProjectionAttributes} from './DatasetSelector';
import { pointWithImage, imageLookup } from './types';
import { scaleBand, color } from 'd3';

let scatterPlot: ScatterPlotWithImage = new ScatterPlotWithImage("scatterPlot", onBrushSelectionChange);
let imageDetails: ImageDetails = new ImageDetails("outerImageDetailsContainer", "innerImageDetailsContainer","selectedPointContainer", "sortByContainer", onPointSelectionChange);
let attributeData: AttributeData = new AttributeData();
let dataSelector: DatasetSelector;
document.getElementById('exportSubsetButton').onclick = () => onExportSubsetClick();
let currentDatasetDisplayName: string;
let currentProjectionDisplayName: string;


let baseFolder = "https://raw.githubusercontent.com/Dev-Lan/image-embedding-data/master/";
if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
{
	baseFolder = "../myData/image-embedding-data/";
}

d3.json(baseFolder + 'examples.json').then(data =>
{
	dataSelector = new DatasetSelector("examplesContainer", "projectionSelectContainer", data, onDatasetChange);
});


function onDatasetChange(dataAttr: DatasetAttributes, projAttr?: ProjectionAttributes): void
{
	currentDatasetDisplayName = dataAttr.displayName;
	let dataFolder = baseFolder + dataAttr.folderName;
	if (dataFolder[dataFolder.length - 1] !== "/")
	{
		dataFolder += "/";
	}
	let projectionSwitchOnly = true;
	if (!projAttr)
	{
		projAttr = dataAttr.projectionList[0];
		projectionSwitchOnly = false;
	}
	currentProjectionDisplayName = projAttr.displayName;
	d3.json(dataFolder + projAttr.filename).then((data: pointWithImage[]) =>
	{
		attributeData.onDataChange(data, dataAttr.imageWidth, dataAttr.imageHeight);


		maybeLoadDistanceMatrix(dataAttr, dataFolder).then(() =>
		{
			scatterPlot.onDataChange(data, attributeData, projectionSwitchOnly, true);

			d3.json(dataFolder + 'imageLookup.json').then((imageLookup: imageLookup)  =>
			{
				imageDetails.onDataChange(
					attributeData,
					imageLookup,
					dataFolder + "tiledImg.png",
					projectionSwitchOnly
					);
			});
		})
	});

}

async function maybeLoadDistanceMatrix(dataAttr: DatasetAttributes, dataFolder: string): Promise<void>
{
	if (dataAttr.hasDistanceMatrix)
	{
		await d3.csv(dataFolder + 'distanceMatrix.txt').then((distMatrix: d3.DSVRowArray<string>) => {
			attributeData.addDistanceMatrix(distMatrix);
		})
	}
	else
	{
		attributeData.hasDistanceMatrix = false;
	}
}


function onBrushSelectionChange(data: pointWithImage[]): void
{
	scatterPlot.onBrushSelectionChange();
	imageDetails.onBrushSelectionChange(data);
}

function onPointSelectionChange(data: pointWithImage | null): void
{
	scatterPlot.onSelectedPointChange(data);
}

function onExportSubsetClick(): void
{
	let fullExportString = '';
	if (imageDetails.currentSelection.length === 0)
	{
		alert('No points are selected for export.')
		return;
	}

	const sortKey = imageDetails.currentSortKey;
	let sortString = 'sort-ascending: ' + sortKey;
	fullExportString += sortString + '\n';

	let [minV, maxV] = scatterPlot.getColorScaleFilterBounds();
	let colorScaleKey = scatterPlot.currentAttributeKey;
	if (colorScaleKey !== 'None')
	{
		if (maxV !== Infinity)
		{
			let filterAttributeString = `filter-${colorScaleKey}: [${minV}, ${maxV}]`;
			fullExportString += filterAttributeString + '\n';

		}
	}

	let [[left, top], [right, bottom]] = [[Infinity, Infinity], [Infinity, Infinity]];
	if (typeof scatterPlot.lastSelectionInValueSpace !== "undefined" && scatterPlot.lastSelectionInValueSpace !== null)
	{
		[[left, top], [right, bottom]] = scatterPlot.lastSelectionInValueSpace;
	}
	if (left !== Infinity)
	{
		let filterXString = `filter-x: [${left}, ${right}]`;
		let filterYString = `filter-y: [${bottom}, ${top}]`;
		fullExportString += filterXString + '\n';
		fullExportString += filterYString + '\n';
	}

	let firstPoint = imageDetails.currentSelection[0];
	let columnHeaders = ['imageKey', 'x', 'y']
	if (firstPoint.attributes)
	{
		for (let attr in firstPoint.attributes)
		{
			columnHeaders.push(attr);
		}
	}

	let headerString = columnHeaders.join(',')
	let attrHeaders = columnHeaders.slice(3)
	fullExportString += '\n' + headerString + '\n';

	for (let point of imageDetails.currentSelection)
	{
		let thisRow = point.image + ',' + point.x + ',' + point.y;
		for (let columnKey of attrHeaders)
		{
			thisRow += ',' + point.attributes[columnKey].value;
		}
		fullExportString += thisRow + '\n';
	}
	let filename = currentDatasetDisplayName + '^' + currentProjectionDisplayName

	downloadFileFromText(filename + '.txt', fullExportString);
}

function downloadFileFromText(filename: string, text: string): void
{
	let tempEl = document.createElement('a');
	tempEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	tempEl.setAttribute('download', filename);
	tempEl.classList.add('noDisp');
	document.body.appendChild(tempEl);
	tempEl.click();
	console.log(tempEl);
	document.body.removeChild(tempEl);
}

window.onresize = () => {
	imageDetails.onWindowResize();
	scatterPlot.onWindowResize();
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

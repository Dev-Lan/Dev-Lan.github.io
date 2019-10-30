import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes'

export interface DatasetAttributes
{
	folderName: string,
	displayName: string,
	imageWidth: number,
	imageHeight: number,
	projectionList: ProjectionAttributes[]
}

export interface ProjectionAttributes
{
	filename: string,
	displayName: string
}

export class DatasetSelector {
	
	constructor(dataContainerId: string, projectionSelectionContainerId: string, datasetList: DatasetAttributes[], selectionChangeCallback: (d1: DatasetAttributes, d2?: ProjectionAttributes) => void) 
	{
		this._datasetList = datasetList;
		this._dataContainerSelect = d3.select("#" + dataContainerId);
		this._projectionContainerSelect = d3.select("#" + projectionSelectionContainerId);
		this._selectionChangeCallback = selectionChangeCallback;
		this.draw();
	}

	private _datasetList : DatasetAttributes[];
	public get datasetList() : DatasetAttributes[] {
		return this._datasetList;
	}

	private _dataContainerSelect : HtmlSelection;
	public get dataContainerSelect() : HtmlSelection {
		return this._dataContainerSelect;
	}

	private _projectionContainerSelect : HtmlSelection;
	public get projectionContainerSelect() : HtmlSelection {
		return this._projectionContainerSelect;
	}

	private _selectionChangeCallback : (d1: DatasetAttributes, d2?: ProjectionAttributes) => void;
	public get selectionChangeCallback() : (d1: DatasetAttributes, d2?: ProjectionAttributes) => void {
		return this._selectionChangeCallback;
	}

	private _currentDataset : DatasetAttributes;
	public get currentDataset() : DatasetAttributes {
		return this._currentDataset;
	}

	private draw(): void
	{

		let thisDataSelector: DatasetSelector = this;
		this.dataContainerSelect.selectAll("button")
			.data(this.datasetList)
			.join("button")
			.text(d => d.displayName)
			.classed("optionButton", true)
			.on("click", function(data: DatasetAttributes)
			{
				if ((this as HTMLElement).classList.contains("selected"))
				{
					return;
				}
				thisDataSelector._currentDataset = data;
				thisDataSelector.selectionChangeCallback(data);
				thisDataSelector.clearSelectedButton(thisDataSelector.dataContainerSelect);
				thisDataSelector.updateProjectionList(data.projectionList);
				d3.select(this).classed("selected", true);
			});
	}

	private clearSelectedButton(containerSelect: HtmlSelection): void
	{
		containerSelect.selectAll(".selected")
			.classed("selected", false);
	}

	private updateProjectionList(projectionList: ProjectionAttributes[]): void
	{
		this.projectionContainerSelect.html(null);

		if (projectionList.length === 1)
		{
			this.projectionContainerSelect
				.append("h5")
				.classed("valueHeader", true)
				.text(projectionList[0].displayName);
			return;
		}

		let thisDataSelector: DatasetSelector = this;
		this.projectionContainerSelect
			.selectAll("button")
			.data(projectionList)
			.join("button")
			.text(d => d.displayName)
			.classed("optionButton", true)
			.classed("selected", (d, i) => i === 0)
			.on("click", function(projFile: ProjectionAttributes)
			{
				if ((this as HTMLElement).classList.contains("selected"))
				{
					return;
				}
				thisDataSelector.selectionChangeCallback(thisDataSelector.currentDataset, projFile);
				thisDataSelector.clearSelectedButton(thisDataSelector.projectionContainerSelect);
				d3.select(this).classed("selected", true);
			})

	}
}
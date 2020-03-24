import * as d3 from 'd3';
import {HtmlSelection, ButtonProps} from '../../lib/DevLibTypes';
import {OptionSelect} from '../../widgets/OptionSelect';

export interface DatasetAttributes
{
	folderName: string,
	displayName: string,
	imageWidth: number,
	imageHeight: number,
	hasDistanceMatrix?: boolean,
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
		this._dataOptions = new OptionSelect(dataContainerId);
		this._selectionChangeCallback = selectionChangeCallback;

		let buttonPropsList: ButtonProps[] = [];
		for (let p of datasetList)
		{
			let buttonProps: ButtonProps = {
				displayName: p.displayName,
				callback: () => {
					selectionChangeCallback(p);
					this.updateProjectionList(p);
				}
			}
			buttonPropsList.push(buttonProps);
		}
		this.dataOptions.onDataChange(buttonPropsList);

		this._projectionOptions = new OptionSelect(projectionSelectionContainerId);

	}

	private _selectionChangeCallback : (d1: DatasetAttributes, d2?: ProjectionAttributes) => void;
	public get selectionChangeCallback() : (d1: DatasetAttributes, d2?: ProjectionAttributes) => void {
		return this._selectionChangeCallback;
	}

	private _dataOptions : OptionSelect;
	public get dataOptions() : OptionSelect {
		return this._dataOptions;
	}

	private _projectionOptions : OptionSelect;
	public get projectionOptions() : OptionSelect {
		return this._projectionOptions;
	}

	private clearSelectedButton(containerSelect: HtmlSelection): void
	{
		containerSelect.selectAll(".selected")
			.classed("selected", false);
	}

	private updateProjectionList(dataSelection: DatasetAttributes): void
	{
		let projectionList = dataSelection.projectionList
		let projPropsList: ButtonProps[] = [];
		for (let proj of projectionList)
		{
			let buttonProps: ButtonProps = {
				displayName: proj.displayName,
				callback: () =>
				{
					this.selectionChangeCallback(dataSelection, proj);
				}
			}
			projPropsList.push(buttonProps);
		}
		this.projectionOptions.onDataChange(projPropsList, 0);
	}
}
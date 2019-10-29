import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {pointWithImage, imageLookup, imageOffset} from './types';


export class ImageDetails {
	
	constructor(htmlContainerId: string, imageLookup: imageLookup)
	{
		this._mainContainer = document.getElementById(htmlContainerId);
		this._mainContainerSelection = d3.select("#" + htmlContainerId);
		this._imageLookup = imageLookup;
	}

	private _mainContainer : HTMLElement;
	public get mainContainer() : HTMLElement {
		return this._mainContainer;
	}

	private _mainContainerSelection : HtmlSelection;
	public get mainContainerSelection() : HtmlSelection {
		return this._mainContainerSelection;
	}
	public set mainContainerSelection(v : HtmlSelection) {
		this._mainContainerSelection = v;
	}

	private _imageLookup : imageLookup;
	public get imageLookup() : imageLookup {
		return this._imageLookup;
	}


	public onBrushSelectionChange(data: pointWithImage[]): void
	{
		let folder = "../data/images/"
		d3.select("#numSelected")
			.html(data.length.toString());

		this.mainContainerSelection.selectAll("div")
			.data(data)
			.join("div")
			.attr("style", d =>
				`
				background-position-x: ${-this.imageLookup[d.image].left}px;
				background-position-y: ${-this.imageLookup[d.image].top}px;
				`)
			.classed("imageInGrid", true);
	}

	private drawImage(filepath: string): void
	{
		let imageEl: HTMLImageElement = document.createElement("img");
		imageEl.src = filepath;
		imageEl.classList.add("imageInGrid")
		this.mainContainer.appendChild(imageEl);
	}
}
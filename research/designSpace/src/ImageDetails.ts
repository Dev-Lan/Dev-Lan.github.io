import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {pointWithImage} from './types';


export class ImageDetails {
	
	constructor(htmlContainerId: string)
	{
		this._mainContainer = document.getElementById(htmlContainerId);
		this._mainContainerSelection = d3.select("#" + htmlContainerId);
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


	public onBrushSelectionChange(data: pointWithImage[]): void
	{
		// this.mainContainer.innerHTML = null;
		let folder = "../data/images/"
		this.mainContainerSelection.selectAll("img")
			.data(data)
			.join("img")
			.attr("src", d => folder + d.image)
			.classed("imageInGrid", true);
		// for (let point of data)
		// {
		// 	let filepath = folder + point.image;
		// 	this.drawImage(filepath);
		// }
	}

	private drawImage(filepath: string): void
	{
		let imageEl: HTMLImageElement = document.createElement("img");
		imageEl.src = filepath;
		imageEl.classList.add("imageInGrid")
		this.mainContainer.appendChild(imageEl);
	}
}
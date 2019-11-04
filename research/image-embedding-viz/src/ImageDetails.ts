import * as d3 from 'd3';
import {DevlibAlgo} from '../../lib/DevlibAlgo';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {pointWithImage, imageLookup, imageOffset} from './types';


export class ImageDetails {
	
	constructor(outerHtmlContainerId: string, innerHtmlContainerId: string)
	{
		this._outerContainerId = outerHtmlContainerId;
		this._outerContainer = document.getElementById(outerHtmlContainerId);
		this._innerContainerSelection = d3.select("#" + innerHtmlContainerId);
		this.onWindowResize();
	}

	private _outerContainerId : string;
	public get outerContainerId() : string {
		return this._outerContainerId;
	}

	private _outerContainer : HTMLElement;
	public get outerContainer() : HTMLElement {
		return this._outerContainer;
	}

	private _innerContainerSelection : HtmlSelection;
	public get innerContainerSelection() : HtmlSelection {
		return this._innerContainerSelection;
	}
	public set innerContainerSelection(v : HtmlSelection) {
		this._innerContainerSelection = v;
	}

	private _currentSelection : pointWithImage[];
	public get currentSelection() : pointWithImage[] {
		return this._currentSelection;
	}

	private _imageLookup : imageLookup;
	public get imageLookup() : imageLookup {
		return this._imageLookup;
	}

	private _tiledImgUrl : string;
	public get tiledImgUrl() : string {
		return this._tiledImgUrl;
	}

	private _imageWidth : number;
	public get imageWidth() : number {
		return this._imageWidth;
	}

	private _imageHeight : number;
	public get imageHeight() : number {
		return this._imageHeight;
	}

	public onDataChange(imageLookup: imageLookup, tiledImgUrl: string, imageWidth: number, imageHeight: number, keepImages: boolean)
	{
		this._imageLookup = imageLookup;
		this._tiledImgUrl = tiledImgUrl;
		this._imageWidth = imageWidth;
		this._imageHeight = imageHeight;
		if (!keepImages)
		{
			this.onBrushSelectionChange([]);
		}
	}

	public onBrushSelectionChange(data: pointWithImage[]): void
	{
		this._currentSelection = data;
		this.sortImages();
		let folder = "../data/images/"
		d3.select("#numSelected")
			.html(data.length.toString());

		const noneSelectedClass = "noneSelectedMessage";
		if (data.length === 0)
		{
			this.innerContainerSelection.html(null);
			this.innerContainerSelection
				.append("h4")
				.classed(noneSelectedClass, true)
				.text("No images selected")
			return;
		}

		this.innerContainerSelection.selectAll("." + noneSelectedClass).remove()

		this.innerContainerSelection.selectAll("div")
			.data(data)
			.join("div")
			.attr("style", d =>
				`
				background-position-x: ${-this.imageLookup[d.image].left}px;
				background-position-y: ${-this.imageLookup[d.image].top}px;
				background-image: url(${this.tiledImgUrl});
				width: ${this.imageWidth}px;
				height: ${this.imageHeight}px;
				`)
			.classed("imageInGrid", true);

	}

	public onWindowResize(): void
	{
		this.onBrushSelectionChange([]);
		let parentElement = this.outerContainer.parentNode as Element;
		let rect: DOMRect | ClientRect = parentElement.getBoundingClientRect();
		// rect.height;
		console.log("Parent Height");
		console.log(rect.height);
		let remainingHeight = rect.height;
		for (let child of parentElement.children)
		{
			if (child.id !== this.outerContainerId)
			{
				let rect: DOMRect | ClientRect = child.getBoundingClientRect();
				remainingHeight -= rect.height;
				console.log(rect.height);
			}
		}
		d3.select("#" + this.outerContainerId).attr("style", `max-height:${remainingHeight}px;`);
	}

	public sortImages(): void
	{
		let sortCompareFunction = DevlibAlgo.sortOnProperty<pointWithImage>((d: pointWithImage) => d.x);
		this.currentSelection.sort(sortCompareFunction);
	}

}
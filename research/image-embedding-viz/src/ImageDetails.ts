import * as d3 from 'd3';
import {DevlibAlgo} from '../../lib/DevlibAlgo';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {pointWithImage, imageLookup, imageOffset} from './types';


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

		this.mainContainerSelection.selectAll("div")
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

	public sortImages(): void
	{
		let sortCompareFunction = DevlibAlgo.sortOnProperty<pointWithImage>((d: pointWithImage) => d.x);
		this.currentSelection.sort(sortCompareFunction);
	}



	private drawImage(filepath: string): void
	{
		let imageEl: HTMLImageElement = document.createElement("img");
		imageEl.src = filepath;
		imageEl.classList.add("imageInGrid")
		this.mainContainer.appendChild(imageEl);
	}
}
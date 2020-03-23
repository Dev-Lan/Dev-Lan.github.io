import * as d3 from 'd3';
import {DevlibAlgo} from '../../lib/DevlibAlgo';
import {HtmlSelection, ButtonProps} from '../../lib/DevLibTypes';
import {OptionSelect} from '../../widgets/OptionSelect';
import {pointWithImage, imageLookup, imageOffset, attributeSelector} from './types';
import { AttributeData } from './AttributeData';

export class ImageDetails {
	
	constructor(outerHtmlContainerId: string, innerHtmlContainerId: string, sortByContainer: string)
	{
		this._outerContainerId = outerHtmlContainerId;
		this._outerContainer = document.getElementById(outerHtmlContainerId);
		this._innerContainerSelection = d3.select("#" + innerHtmlContainerId);
		this._sortOptions = new OptionSelect(sortByContainer);
		this._detailsContainerSelect = d3.select("#detailsContainerPopup");
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

	private _sortOptions : OptionSelect;
	public get sortOptions() : OptionSelect {
		return this._sortOptions;
	}

	private _currentSortSelector : attributeSelector;
	public get currentSortSelector() : attributeSelector {
		return this._currentSortSelector;
	}

	private _currentSortKey : string;
	public get currentSortKey() : string {
		return this._currentSortKey;
	}
	

	private _attributeData : AttributeData;
	public get attributeData() : AttributeData {
		return this._attributeData;
	}

	private _detailsContainerSelect : HtmlSelection;
	public get detailsContainerSelect() : HtmlSelection {
		return this._detailsContainerSelect;
	}

	public onDataChange(attributeData: AttributeData, imageLookup: imageLookup, tiledImgUrl: string, imageWidth: number, imageHeight: number, keepImages: boolean)
	{
		this._imageLookup = imageLookup;
		this._tiledImgUrl = tiledImgUrl;
		this._imageWidth = imageWidth;
		this._imageHeight = imageHeight;
		this._attributeData = attributeData;
		if (!keepImages)
		{
			this.onBrushSelectionChange([]);
		}
		this.updateSortOptions();
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

		let thisObj = this;
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
			.classed("imageInGrid", true)
			.on('click', function(d)
			{
				// todo - open distance filter functionality
			})
			.on("mouseenter", function(d)
			{
				console.log(this);
				let rect: DOMRect | ClientRect = (this as HTMLElement).getBoundingClientRect();


				thisObj.detailsContainerSelect.html(null)
					.classed("noDisp", false)
					.attr("style", 
						`top: ${rect.bottom + 10}px;
						left: ${rect.left}px`)

				thisObj.detailsContainerSelect.append("h4")
					.text(d.image);

				thisObj.detailsContainerSelect.append("p")
					.text(`x: ${d.x}`)

				thisObj.detailsContainerSelect.append("p")
					.text(`y: ${d.y}`)

				for (let attr in d.attributes)
				{
					let attrObj = d.attributes[attr];
					thisObj.detailsContainerSelect.append("p")
						.text(`${attrObj.displayName}: ${attrObj.value}`)
				}
			})
			.on("mouseleave", (d) =>
			{
				this.detailsContainerSelect.html(null)
					.classed("noDisp", true);
			});
	}

	private updateSortOptions(): void
	{
		let buttonPropList: ButtonProps[] = this.attributeData.getButtonProps((key, selector) => {
			this._currentSortKey = key;
			this._currentSortSelector = selector;
			this.onBrushSelectionChange(this.currentSelection)
		}, true);

		// by default the X-Axis sorting is first
		this._currentSortKey = 'X-Axis'; 
		this._currentSortSelector = buttonPropList[0].callback as attributeSelector;

		this.sortOptions.onDataChange(buttonPropList, true);
	}

	public onWindowResize(): void
	{
		this.onBrushSelectionChange([]);
		let parentElement = this.outerContainer.parentNode as Element;
		let rect: DOMRect | ClientRect = parentElement.getBoundingClientRect();
		let remainingHeight = rect.height;
		for (let child of parentElement.children)
		{
			if (child.id !== this.outerContainerId)
			{
				let rect: DOMRect | ClientRect = child.getBoundingClientRect();
				remainingHeight -= rect.height;
			}
		}
		d3.select("#" + this.outerContainerId).attr("style", `max-height:${remainingHeight}px;`);
	}

	public sortImages(): void
	{
		if (typeof this.currentSortSelector === "undefined" || this.currentSortSelector === null)
		{
			return;
		}
		let sortCompareFunction = DevlibAlgo.sortOnProperty<pointWithImage>(this.currentSortSelector);
		this.currentSelection.sort(sortCompareFunction);
	}

}
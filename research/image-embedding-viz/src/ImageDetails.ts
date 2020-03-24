import * as d3 from 'd3';
import {DevlibAlgo} from '../../lib/DevlibAlgo';
import {HtmlSelection, ButtonProps} from '../../lib/DevLibTypes';
import {OptionSelect} from '../../widgets/OptionSelect';
import {pointWithImage, imageLookup, imageOffset, attributeSelector} from './types';
import { AttributeData } from './AttributeData';

export class ImageDetails {
	
	constructor(outerHtmlContainerId: string, innerHtmlContainerId: string, selectedPointContainerId: string, sortByContainer: string, pointChangeCallback: (data: pointWithImage | null) => void)
	{
		this._outerContainerId = outerHtmlContainerId;
		this._outerContainer = document.getElementById(outerHtmlContainerId);
		this._innerContainerSelection = d3.select("#" + innerHtmlContainerId);
		this._sortOptions = new OptionSelect(sortByContainer);
		this._detailsContainerSelect = d3.select("#detailsContainerPopup");
		this._selectedPointContainer = document.getElementById(selectedPointContainerId);
		this._pointChangeCallback = pointChangeCallback;
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
	
	private _selectedPointContainer : HTMLElement;
	public get selectedPointContainer() : HTMLElement {
		return this._selectedPointContainer;
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

	
	private _pointChangeCallback : (d: pointWithImage | null) => void;
	public get pointChangeCallback() : (d: pointWithImage | null) => void {
		return this._pointChangeCallback;
	}	

	public onDataChange(attributeData: AttributeData, imageLookup: imageLookup, tiledImgUrl: string, keepImages: boolean)
	{
		this._imageLookup = imageLookup;
		this._tiledImgUrl = tiledImgUrl;
		this._attributeData = attributeData;
		if (!keepImages)
		{
			this.onBrushSelectionChange([]);
		}
		this.updateSelectedPoint(null);
		this.updateSortOptions();
	}

	public onBrushSelectionChange(data: pointWithImage[]): void
	{
		this._currentSelection = data;
		this.sortImages();
		let folder = "../data/images/"
		d3.select("#numSelected")
			.html(this.currentSelection.length.toString());

		const noneSelectedClass = "noneSelectedMessage";
		if (this.currentSelection.length === 0)
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
			.data(this.currentSelection)
			.join("div")
			.attr("style", d => this.getThumbnailStyle(d))
			.classed("imageInGrid", true)
			.on('click', (d) => this.onClick(d))
			.on("mouseenter", function(d)
			{
				thisObj.onMouseEnter(this as HTMLElement, d);
			})
			.on("mouseleave", () => this.onMouseLeave());
	}

	private onClick(d: pointWithImage) {
		if (d !== this.attributeData.currentSelectedPoint)
		{
			this.updateSelectedPoint(d);
		}
		else
		{
			this.updateSelectedPoint(null);
		}
	}

	private onMouseEnter(enterElement: HTMLElement, d: pointWithImage)
	{
		let rect: DOMRect | ClientRect = enterElement.getBoundingClientRect();
		this.detailsContainerSelect.html(null)
			.classed("noDisp", false)
			.attr("style", 
				`top: ${rect.bottom + 10}px;
				left: ${rect.left}px`
				);

		this.detailsContainerSelect.append("h4")
			.text(d.image);
		this.detailsContainerSelect.append("p")
			.text(`x: ${d.x}`);
		this.detailsContainerSelect.append("p")
			.text(`y: ${d.y}`);

		for (let attr in d.attributes)
		{
			let attrObj = d.attributes[attr];
			this.detailsContainerSelect.append("p")
				.text(`${attrObj.displayName}: ${attrObj.value}`);
		}
	}

	private onMouseLeave() {
		this.detailsContainerSelect.html(null)
			.classed("noDisp", true);
	}

	private getThumbnailStyle(d: pointWithImage): string
	{
		return `
				background-position-x: ${-this.imageLookup[d.image].left}px;
				background-position-y: ${-this.imageLookup[d.image].top}px;
				background-image: url(${this.tiledImgUrl});
				width: ${this.attributeData.imageWidth}px;
				height: ${this.attributeData.imageHeight}px;
				`;
	}

	private updateSelectedPoint(point: pointWithImage | null): void
	{
		this.attributeData.currentSelectedPoint = point;
		this.pointChangeCallback(point);
		this.updateDistanceSortOption(point);
		if (point === null)
		{
			this.selectedPointContainer.classList.add('noDisp');
			return;
		}
		this.selectedPointContainer.classList.remove('noDisp');

		let styleString: string = this.getThumbnailStyle(point);



		d3.selectAll(".selectedImageContainer")
			.attr('style', styleString)
			.on('click', () => this.onClick(point))
			.on("mouseenter", () => this.onMouseEnter(this.selectedPointContainer, point))
			.on("mouseleave", () => this.onMouseLeave());

	}

	private updateSortOptions(): void
	{
		let buttonPropList: ButtonProps[] = this.attributeData.getButtonProps((key, selector) => {
			this._currentSortKey = key;
			this._currentSortSelector = selector;
			this.onBrushSelectionChange(this.currentSelection);
		}, true);

		// by default the X-Axis sorting is first
		this._currentSortKey = 'X-Axis'; 
		this._currentSortSelector = buttonPropList[0].callback as attributeSelector;

		this.sortOptions.onDataChange(buttonPropList, 0);
	}
	
	private updateDistanceSortOption(point: pointWithImage | null): void
	{
		if (!this.attributeData.hasDistanceMatrix)
		{
			return;
		}
		const distanceButtonName = "Distance To Selection";
		if (point === null)
		{
			this.sortOptions.removeButton(distanceButtonName);
			return;
		}

		let newButton: ButtonProps = {
			displayName: distanceButtonName,
			callback: () => this.onChangeToDistanceToSelection(point)
		};
		this.sortOptions.replaceButton(distanceButtonName, newButton);
	}

	private onChangeToDistanceToSelection(point: pointWithImage | null): void
	{
		this._currentSortKey = "distanceTo-" + point.image;
		this._currentSortSelector = null;
		this.onBrushSelectionChange(this.currentSelection);
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
			if (!this.attributeData || !this.attributeData.hasDistanceMatrix || !this.attributeData.currentSelectedPoint)
			{
				return;
			}
			this.sortImagesBasedOnDistanceToCurrentSelection();
			return;
		}
		let sortCompareFunction = DevlibAlgo.sortOnProperty<pointWithImage>(this.currentSortSelector);
		this.currentSelection.sort(sortCompareFunction);
	}

	private sortImagesBasedOnDistanceToCurrentSelection(): void
	{
		let distanceTo: number[] = this.attributeData.currentSelectedPoint.distanceTo;
		let distanceToWithOriginalIndex: [number, number][] = []
		for (let i = 0; i < distanceTo.length; i++)
		{
			let dist = distanceTo[i];
			distanceToWithOriginalIndex.push([dist, i]);
		}
		let getFirst = (tuple: [number, number]) => tuple[0];
		let sortFunc = DevlibAlgo.sortOnProperty<[number, number]>(getFirst);
		distanceToWithOriginalIndex.sort(sortFunc);
		let sortedSelection: pointWithImage[] = [];
		let tempDataLookup = new Set<string>();
		for (let point of this.currentSelection)
		{
			tempDataLookup.add(point.image);
		}
		for (let [dist, index] of distanceToWithOriginalIndex)
		{
			let point = this.attributeData.data[index];
			if (tempDataLookup.has(point.image))
			{
				sortedSelection.push(point);
			}
		}
		this._currentSelection = sortedSelection;
	}

}
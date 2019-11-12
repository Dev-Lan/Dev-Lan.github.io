import * as d3 from 'd3';
import {SvgSelection, Margin} from '../../lib/DevLibTypes';
import {pointWithImage, attributeSelector} from './types';
import { AttributeData } from './AttributeData';
import {OptionSelect} from '../../widgets/OptionSelect';

export class ScatterPlotWithImage {
	
	constructor(svgContainerId: string, brushChangeCallback: (data: pointWithImage[]) => void)
	{
		this._svgSelect = d3.select("#" + svgContainerId);
		this._brushChangeCallback = brushChangeCallback;

		const pad = 40;
		this._margin = {
			top: pad,
			right: pad,
			bottom: pad,
			left: pad
		}
		this._colorMapSelect = new OptionSelect("attributeSelectContainer");
		this._currentAttributeKey = "None";
		this.initialize()

	}

	private _data : pointWithImage[];
	public get data() : pointWithImage[] {
		return this._data;
	}

	private _svgSelect : SvgSelection;
	public get svgSelect() : SvgSelection {
		return this._svgSelect;
	}

	private _mainGroupSelect : SvgSelection;
	public get mainGroupSelect() : SvgSelection {
		return this._mainGroupSelect;
	}

	private _brushGroupSelect : SvgSelection;
	public get brushGroupSelect() : SvgSelection {
		return this._brushGroupSelect;
	}

	private _zoomRectSelect : SvgSelection;
	public get zoomRectSelect() : SvgSelection {
		return this._zoomRectSelect;
	}

	private _zoom : d3.ZoomBehavior<any, any>;
	public get zoom() : d3.ZoomBehavior<any, any> {
		return this._zoom;
	}

	private _margin : Margin;
	public get margin() : Margin {
		return this._margin;
	}

	private _width : number;
	public get width() : number {
		return this._width;
	}

	private _height : number;
	public get height() : number {
		return this._height;
	}

	private _scaleX : d3.ScaleLinear<number, number>;
	public get scaleX() : d3.ScaleLinear<number, number> 
	{
		if (this.lastTransform !== null && typeof this.lastTransform !== "undefined")
		{
			return this.lastTransform.rescaleX(this._scaleX);
		}
		return this._scaleX;
	}
	
	private _scaleY : d3.ScaleLinear<number, number>;
	public get scaleY() : d3.ScaleLinear<number, number> {
		if (this.lastTransform !== null && typeof this.lastTransform !== "undefined")
		{
			return this.lastTransform.rescaleY(this._scaleY);
		}
		return this._scaleY;
	}

	private _lastTransform : d3.ZoomTransform | null | undefined;
	public get lastTransform() : d3.ZoomTransform | null | undefined {
		return this._lastTransform;
	}

	private _transformAtLastSelection : d3.ZoomTransform | null | undefined;
	public get transformAtLastSelection() : d3.ZoomTransform | null | undefined {
		return this._transformAtLastSelection;
	}

	private _lastSelection : [[number, number], [number, number]] | null | undefined;
	public get lastSelection() : [[number, number], [number, number]] | null | undefined {
		return this._lastSelection;
	}

	private _lastSelectionInValueSpace : [[number, number], [number, number]] | null | undefined;
	public get lastSelectionInValueSpace() : [[number, number], [number, number]] | null | undefined {
		return this._lastSelectionInValueSpace;
	}

	private _brush : d3.BrushBehavior<any>;
	public get brush() : d3.BrushBehavior<any> {
		return this._brush;
	}

	private _brushChangeCallback : (data: pointWithImage[]) => void;
	public get brushChangeCallback() : (data: pointWithImage[]) => void {
		return this._brushChangeCallback;
	}

	private _attributeData : AttributeData;
	public get attributeData() : AttributeData {
		return this._attributeData;
	}

	private _colorMapSelect : OptionSelect;
	public get colorMapSelect() : OptionSelect {
		return this._colorMapSelect;
	}

	private _currentAttributeKey : string;
	public get currentAttributeKey() : string {
		return this._currentAttributeKey;
	}

	private _colorSelector : attributeSelector;
	public get colorSelector() : attributeSelector {
		return this._colorSelector;
	}

	// private _colorScale : d3.ScaleSequential<string>;
	// public get colorScale() : d3.ScaleSequential<string> {
	// 	return this._colorScale;
	// }

	public onDataChange(data: pointWithImage[], attributeData: AttributeData, projectionSwitchOnly: boolean, resetView: boolean): void
	{
		this._data = data;
		if (resetView)
		{
			this.resetZoomAndBrush();
			if (!projectionSwitchOnly)
			{
				this.clearHighlightedData();
			}
			this._attributeData = attributeData;
			let buttonPropList = this.attributeData.getButtonProps((key, selector) => this.onAttributeChange(key, selector));
			console.log(buttonPropList);
			this.colorMapSelect.onDataChange(buttonPropList, true);
			this._currentAttributeKey = "None";
			this._colorSelector = null;
		}

		let minX = d3.min(this.data, d => d.x);
		let maxX = d3.max(this.data, d => d.x);
		this._scaleX = d3.scaleLinear()
			.domain([minX, maxX])
			.range([0, this.width]);

		let minY = d3.min(this.data, d => d.y);
		let maxY = d3.max(this.data, d => d.y);
		this._scaleY = d3.scaleLinear()
			.domain([minY, maxY])
			.range([this.height, 0]);

		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.join("circle")
			.attr('cx', d => this.scaleX(d.x))
			.attr('cy', d => this.scaleY(d.y))
			.attr("r", 2)
			// .attr("fill", "white")
			.classed("imagePoint", true);
		this.onAttributeChange(this.currentAttributeKey, this.colorSelector);
	}

	private onAttributeChange(key: string, selector: attributeSelector): void
	{
		console.log(key);
		console.log(selector);
		this._currentAttributeKey = key;
		this._colorSelector = selector;

		if (key === "None")
		{
			this.setNoColorMap();
			return
		}

		let domain = this.attributeData.getMinMax(key);
		let colorScale = d3.scaleSequential(d3.interpolateInferno)
			.domain(domain);


		console.log(domain);
		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.join("circle")
			.attr("fill", d => colorScale(this.colorSelector(d)))
			.attr("fill-opacity", "1");
	}

	private setNoColorMap(): void
	{
		console.log("set to none")
		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.join("circle")
			.attr("fill-opacity", "0");
	}

	private initialize(): void
	{
		this.svgSelect.html(null)
			.attr("style", "display: none");
		let parentElement = this.svgSelect.node().parentNode as Element;
		let rect: DOMRect | ClientRect = parentElement.getBoundingClientRect();

		this._width = rect.width - this.margin.left - this.margin.right;
		this._height = rect.height - this.margin.top - this.margin.bottom;

		this.svgSelect
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.attr("style", null);


		this._mainGroupSelect = this.svgSelect.append("g");
		this.mainGroupSelect
			.attr("transform", `translate(${this.margin.top}, ${this.margin.left})`)
			.attr("width", this.width)
			.attr("height", this.height)
			.classed("mainGroup", true);


		const extentWithMargin: [[number, number],[number, number]] = [[-this.margin.left, -this.margin.top], [ this.width + this.margin.right, this.height + this.margin.bottom]];

		// init zoom behavior
		this._zoomRectSelect = this.svgSelect
		  .append("g")
			.attr("id", "zoomGroup")
			.attr("transform", `translate(${this.margin.top}, ${this.margin.left})`)
		  .append("rect");
		this.zoomRectSelect
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("opacity", 0);

		let zoomPadX = this.margin.right / 2;
		let zoomPadY = this.margin.bottom / 2;

		this._zoom = d3.zoom()
			.scaleExtent([1, 20])
			.translateExtent([[-zoomPadX, -zoomPadY], [this.width + this.margin.right + this.margin.left + zoomPadX, this.height + this.margin.top + this.margin.bottom + zoomPadY]])
			.on("zoom", () => { this.zoomHandler(); });
		this.zoomRectSelect.call(this.zoom);

		// init brush behavior
		this._brushGroupSelect = this.svgSelect.append("g");
		this.brushGroupSelect
			.attr("transform", `translate(${this.margin.top}, ${this.margin.left})`)
			.classed("brushContainer", true)

		this._brush = d3.brush()
			.extent(extentWithMargin)
			.on("start brush end", () => { this.brushHandler(); });
		this.brushGroupSelect.call(this.brush);
	}

	private brushHandler(): void
	{
		const selection: [[number, number], [number, number]] | null  | undefined = d3.event.selection;
		if (d3.event.sourceEvent && d3.event.sourceEvent.type !== "zoom")
		{
			this.updateBrush(selection)
		}
	}

	private updateBrush(selection: [[number, number], [number, number]]): void
	{
		this._lastSelection = selection;
		this._transformAtLastSelection = this.lastTransform;
		this.clearHighlightedData();
		if (this.lastSelection === null || typeof this.lastSelection === "undefined")
		{
			return;
		}
		let [[left, top], [right, bottom]] = this.lastSelection;

		left = this.scaleX.invert(left);
		right = this.scaleX.invert(right);
		top = this.scaleY.invert(top);
		bottom = this.scaleY.invert(bottom);
		this._lastSelectionInValueSpace = [[left, top], [right, bottom]];

		let dataInBrush = this.data.filter((d: pointWithImage) =>
		{
			let insideX: boolean = left <= d.x && d.x <= right;
			let insideY: boolean = bottom <= d.y && d.y <= top;
			return insideX && insideY;
		});
		this.brushChangeCallback(dataInBrush);
	}

	private zoomHandler(): void
	{
		this._lastTransform = d3.event.transform;
		this.updateZoom();
	}

	private updateZoom(): void
	{
		this.mainGroupSelect.attr("transform", `translate(${this.margin.top}, ${this.margin.left}) ` + this.lastTransform.toString());

		if (this.lastSelection)
		{

			let [[left,top],[right,bottom]] = this.lastSelection;
			if (this.transformAtLastSelection !== null && typeof this.transformAtLastSelection !== "undefined")
			{
				[left, top] = this.transformAtLastSelection.invert([left,top]);
				[right, bottom] = this.transformAtLastSelection.invert([right,bottom]);		
			}
			[left, top] = this.lastTransform.apply([left,top]);
			[right, bottom] = this.lastTransform.apply([right,bottom]);
			this.brushGroupSelect.call(this.brush.move, [[left, top], [right, bottom]])
		}

		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "mousemove")
		{
			return;
			// no scale occured, so no need to update the circles.
		}
		this.mainGroupSelect.selectAll("circle")
			.attr("r", 2 / this.lastTransform.k)
			.attr("style", `stroke-width: ${1 / this.lastTransform.k};`);
	}

	private resetZoomAndBrush(): void
	{
		this._lastSelection = null;
		this._lastTransform = null;
		this._transformAtLastSelection = null;
		this.zoomRectSelect.call(this.zoom.transform, d3.zoomIdentity);
		this.brushGroupSelect.call(this.brush.move, null);
	}

	private clearHighlightedData(): void
	{
		this.mainGroupSelect.selectAll(".dataInBrush")
			.classed("dataInBrush", false);
	}

	public onBrushSelectionChange(data: pointWithImage[]): void
	{
		this.mainGroupSelect.selectAll("circle")
			.data(data, (d: pointWithImage) => d.image)
			.classed("dataInBrush", true);
	}

	public onWindowResize(): void
	{
		this.zoomRectSelect.call(this.zoom.transform, d3.zoomIdentity);

		this.initialize();
		this.onDataChange(this.data, this.attributeData, false, false);

		this.zoomRectSelect.call(this.zoom.transform, this.lastTransform);

		let [[left, top], [right, bottom]] = this.lastSelectionInValueSpace;
		left = this.scaleX(left);
		right = this.scaleX(right);
		top = this.scaleY(top);
		bottom = this.scaleY(bottom);

		let selection: [[number, number], [number, number]] = [[left, top], [right, bottom]];
 		this.brushGroupSelect.call(this.brush.move, selection);
 		this.updateBrush(selection);
	}


	public onShiftKeyDown(): void
	{
		d3.select("#zoomGroup").raise();
	}

	public onShiftKeyUp(): void
	{
		this.brushGroupSelect.raise();
	}

}
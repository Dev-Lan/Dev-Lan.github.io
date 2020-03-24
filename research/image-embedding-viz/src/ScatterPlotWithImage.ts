import * as d3 from 'd3';
import {SvgSelection, Margin} from '../../lib/DevLibTypes';
import {pointWithImage, attributeSelector} from './types';
import { AttributeData } from './AttributeData';
import {OptionSelect} from '../../widgets/OptionSelect';
import {ColorScaleLegend} from './ColorScaleLegend';

export class ScatterPlotWithImage {
	
	constructor(svgContainerId: string, brushChangeCallback: (data: pointWithImage[]) => void)
	{
		this._svgSelect = d3.select("#" + svgContainerId);
		this._brushChangeCallback = brushChangeCallback;

		const pad = 40;
		this._margin = {
			top: pad,
			right: 108,
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

	private _colorLegendGroupSelect : SvgSelection;
	public get colorLegendGroupSelect() : SvgSelection {
		return this._colorLegendGroupSelect;
	}

	private _colorScaleLegend : ColorScaleLegend;
	public get colorScaleLegend() : ColorScaleLegend {
		return this._colorScaleLegend;
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

	public onDataChange(data: pointWithImage[], attributeData: AttributeData, projectionSwitchOnly: boolean, resetView: boolean, fromResize = false): void
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
			// console.log(buttonPropList);
			this.colorMapSelect.onDataChange(buttonPropList, true);
			this._currentAttributeKey = "None";
			this._colorSelector = null;
		}

		// position color scale legend since it depends on the size of the thumbnails
		const legendPadding = 10;
		this.colorLegendGroupSelect.attr("transform", 
			`translate(
				${this.margin.left + this.width + legendPadding},
				${this.margin.top + this.attributeData.imageHeight + legendPadding})`
		)	


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
		this.onAttributeChange(this.currentAttributeKey, this.colorSelector, fromResize);
	}

	private onAttributeChange(key: string, selector: attributeSelector, fromResize = false): void
	{
		this._currentAttributeKey = key;
		this._colorSelector = selector;

		if (!fromResize)
		{
			this.brush1dHandler(null)
		}

		if (key === "None")
		{
			this.setNoColorMap();
			return
		}

		let domain = this.attributeData.getMinMax(key);
		let colorScale = d3.scaleSequential(d3.interpolateWarm)
			.domain(domain);

		this.colorScaleLegend.onDataChange(colorScale, fromResize);

		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.join("circle")
			.attr("fill", d => colorScale(this.colorSelector(d)))
			.attr("fill-opacity", "1");

	}

	private setNoColorMap(): void
	{
		// console.log("set to none")
		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.join("circle")
			.attr("fill-opacity", "0");
		this.colorScaleLegend.hideLegend();
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

		// init zoom behavior
		this._zoomRectSelect = this.svgSelect
		  .append("g")
			.attr("id", "zoomGroup")
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
		  .append("rect");
		this.zoomRectSelect
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("opacity", 0);

		const zoomPanExtent: [[number, number],[number, number]] = [
			[ 0, 0], 
			[
				this.width + this.margin.right + this.margin.left,
				this.height + this.margin.top + this.margin.bottom
			]];

		this._zoom = d3.zoom()
			.scaleExtent([1, 20])
			.translateExtent(zoomPanExtent)
			.on("zoom", () => { this.zoomHandler(); });
		this.zoomRectSelect.call(this.zoom);

		const brushPad = 8;
		const brushExtent: [[number, number],[number, number]] = [[-brushPad, -brushPad], [this.width + brushPad, this.height + brushPad]];
		// init brush behavior
		this._brushGroupSelect = this.svgSelect.append("g");
		this.brushGroupSelect
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
			.classed("brushContainer", true)

		this._brush = d3.brush()
			.extent(brushExtent)
			.on("start brush end", () => { this.brushHandler(); });
		this.brushGroupSelect.call(this.brush);
		
		this._colorLegendGroupSelect = this.svgSelect.append("g");
		this.colorLegendGroupSelect.classed("colorLegendGroup", true);			

		let oldSelection;
		if (this.colorScaleLegend)
		{
			 oldSelection = this.colorScaleLegend.lastSelectionInValueSpace;
		}
		this._colorScaleLegend = new ColorScaleLegend(this.colorLegendGroupSelect, (selection) => this.brush1dHandler(selection) );
		this.colorScaleLegend.updateSelection(oldSelection);
	}

	private brushHandler(): void
	{
		const selection: [[number, number], [number, number]] | null  | undefined = d3.event.selection;
		if (d3.event.sourceEvent && d3.event.sourceEvent.type !== "zoom")
		{

			this.update2dBrushSelection(selection);
			this.updateDataSelection()
		}
	}

	private brush1dHandler(brushRange: [number, number] | null | undefined): void
	{
		console.log("brush 1D handler");
		this.update1dBrushSelection(brushRange);
		this.updateDataSelection();
	}

	private update2dBrushSelection(selection: [[number, number], [number, number]]): void
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
	}

	private update1dBrushSelection(newSelection: [number, number] | null | undefined): void
	{
		this.colorScaleLegend.updateSelection(newSelection);
	}

	private updateDataSelection(): void
	{
		let [[left, top], [right, bottom]] = [[Infinity, Infinity], [Infinity, Infinity]];
		if (typeof this.lastSelectionInValueSpace !== "undefined" && this.lastSelectionInValueSpace !== null)
		{
			[[left, top], [right, bottom]] = this.lastSelectionInValueSpace;
		}

		let [minV, maxV] = this.getColorScaleFilterBounds();

		let filteredData: pointWithImage[] = [];
		for (let d of this.data)
		{
			let insideX: boolean = left <= d.x && d.x <= right;
			let insideY: boolean = bottom <= d.y && d.y <= top;
			let insideVal = true;
			if (this.currentAttributeKey !== "None")
			{
				let value: number = this.colorSelector(d);
				insideVal = minV <= value && value <= maxV;
			}
			d.in1dBrush = insideVal;
			d.in2dBrush = insideX && insideY;
			if (d.in1dBrush && d.in2dBrush)
			{
				filteredData.push(d);
			}
		}

		this.brushChangeCallback(filteredData);
	}

	public getColorScaleFilterBounds(): [number, number]
	{
		let minV: number
		let maxV: number;
		if (typeof this.colorScaleLegend.lastSelectionInValueSpace === "undefined" || this.colorScaleLegend.lastSelectionInValueSpace === null)
		{
			minV = -Infinity;
			maxV = Infinity;
		}
		else 
		{
			[minV, maxV] = this.colorScaleLegend.lastSelectionInValueSpace;
		}
		return [minV, maxV]
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

	public onBrushSelectionChange(): void
	{
		this.mainGroupSelect.selectAll("circle")
			.data(this.data, (d: pointWithImage) => d.image)
			.classed("dataInBrush", d => d.in2dBrush)
			.classed("noDisp", d => !d.in1dBrush);
	}

	public onWindowResize(): void
	{
		this.zoomRectSelect.call(this.zoom.transform, d3.zoomIdentity);

		this.initialize();
		this.onDataChange(this.data, this.attributeData, false, false, true);

		this.zoomRectSelect.call(this.zoom.transform, this.lastTransform);

		if (typeof this.lastSelectionInValueSpace !== "undefined" && this.lastSelectionInValueSpace !== null)
		{
			let [[left, top], [right, bottom]] = this.lastSelectionInValueSpace;
			left = this.scaleX(left);
			right = this.scaleX(right);
			top = this.scaleY(top);
			bottom = this.scaleY(bottom);

			let selection: [[number, number], [number, number]] = [[left, top], [right, bottom]];
	 		this.brushGroupSelect.call(this.brush.move, selection);
	 		this.update2dBrushSelection(selection);
		}
 		this.colorScaleLegend.resetBrush();
 		this.updateDataSelection();
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
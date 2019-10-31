import * as d3 from 'd3';
import {SvgSelection, Margin} from '../../lib/DevLibTypes';
import {pointWithImage} from './types';

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

	private _zoom : d3.ZoomBehavior;
	public get zoom() : d3.ZoomBehavior {
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
	public get scaleX() : d3.ScaleLinear<number, number> {
		return this._scaleX;
	}
	
	private _scaleY : d3.ScaleLinear<number, number>;
	public get scaleY() : d3.ScaleLinear<number, number> {
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

	private _brush : d3.BrushBehavior<any>;
	public get brush() : d3.BrushBehavior<any> {
		return this._brush;
	}

	private _brushChangeCallback : (data: pointWithImage[]) => void;
	public get brushChangeCallback() : (data: pointWithImage[]) => void {
		return this._brushChangeCallback;
	}

	public onDataChange(data: pointWithImage[], projectionSwitchOnly: boolean): void
	{
		this._data = data;
		this.resetZoomAndBrush();
		if (!projectionSwitchOnly)
		{
			this.clearHighlightedData();
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
			.classed("imagePoint", true);
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
			.scaleExtent([1, 15])
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
		console.log(d3.event);
		if (d3.event.sourceEvent && d3.event.sourceEvent.type !== "zoom")
		{
			this._lastSelection = selection;
			this._transformAtLastSelection = this.lastTransform;
			this.updateBrush()
		}
	}

	private updateBrush(): void
	{
		this.clearHighlightedData();
		if (this.lastSelection === null || typeof this.lastSelection === "undefined")
		{
			return;
		}
		let [[left, top], [right, bottom]] = this.lastSelection;

		let scaleX;
		let scaleY;
		if (this.lastTransform !== null && typeof this.lastTransform !== "undefined")
		{
			scaleX = this.lastTransform.rescaleX(this.scaleX);
			scaleY = this.lastTransform.rescaleY(this.scaleY);
		}
		else
		{
			scaleX = this.scaleX;
			scaleY = this.scaleY;
		}

		left = scaleX.invert(left);
		right = scaleX.invert(right);
		top = scaleY.invert(top);
		bottom = scaleY.invert(bottom);


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
		this.initialize();
		this.onDataChange(this.data, false);
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
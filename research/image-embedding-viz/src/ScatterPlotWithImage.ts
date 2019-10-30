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

	private _brush : d3.BrushBehavior<any>;
	public get brush() : d3.BrushBehavior<any> {
		return this._brush;
	}

	private _brushChangeCallback : (data: pointWithImage[]) => void;
	public get brushChangeCallback() : (data: pointWithImage[]) => void {
		return this._brushChangeCallback;
	}

	public onDataChange(data: pointWithImage[],): void
	{
		this._data = data;
		this.brushGroupSelect.call(this.brush.move, null);

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
		console.log(rect)
		console.log(rect.width)
		console.log(rect.height)

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
		console.log(extentWithMargin);
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

		let zoomBehavior = d3.zoom()
			.scaleExtent([1, 15])
			.translateExtent([[-zoomPadX, -zoomPadY], [this.width + this.margin.right + this.margin.left + zoomPadX, this.height + this.margin.top + this.margin.bottom + zoomPadY]])
			.on("zoom", () => { this.zoomHandler(); });

		this.zoomRectSelect.call(zoomBehavior);

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
		this.clearHighlightedData();
		const selection: [[number, number], [number, number]] | null  | undefined = d3.event.selection;
		if (selection === null || typeof selection === "undefined")
		{
			return;
		}
		let [[left, top], [right, bottom]] = selection;
		left = this.scaleX.invert(left);
		right = this.scaleX.invert(right);
		top = this.scaleY.invert(top);
		bottom = this.scaleY.invert(bottom);

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
		const newZoom = d3.event.transform;
		console.log(newZoom.toString());
		this.brushGroupSelect.attr("transform", `translate(${this.margin.top}, ${this.margin.left}) ` + newZoom.toString());
		this.mainGroupSelect.attr("transform", `translate(${this.margin.top}, ${this.margin.left}) ` + newZoom.toString());


		if (d3.event.sourceEvent.type === "mousemove")
		{
			return;
			// no scale occured, so no need to update the circles.
		}
		this.mainGroupSelect.selectAll("circle")
			.attr("r", 2 / newZoom.k)
			.attr("style", `stroke-width: ${1 / newZoom.k};`);

		// let scaleX = d3.event.transform.rescaleX(this.scaleX);
		// let scaleY = d3.event.transform.rescaleY(this.scaleY);
		// this.mainGroupSelect.selectAll("circle")
		// 	.data(this.data, (d: pointWithImage) => d.image)
		// 	.join("circle")
		// 	.attr('cx', d => scaleX(d.x))
		// 	.attr('cy', d => scaleY(d.y))
	}

	private resetZoom(): void
	{
		// todo
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
		this.onDataChange(this.data);
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
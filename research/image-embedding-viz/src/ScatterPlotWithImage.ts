import * as d3 from 'd3';
import {SvgSelection, Margin} from '../../lib/DevLibTypes';
import {pointWithImage} from './types';

export class ScatterPlotWithImage {
	
	constructor(svgContainerId: string, data: pointWithImage[], brushChangeCallback: (data: pointWithImage[]) => void)
	{
		this._data = data;
		this._svgSelect = d3.select("#" + svgContainerId);
		this._brushChangeCallback = brushChangeCallback;
		this._width = 800;
		this._height = 800;
		const pad = 40;
		this._margin = {
			top: pad,
			right: pad,
			bottom: pad,
			left: pad
		}
		this.svgSelect
			.attr("width", this.width + 2 * pad)
			.attr("height", this.height + 2 * pad);

		this._mainGroupSelect = this.svgSelect.append("g");
		this.mainGroupSelect
			.attr("transform", `translate(${this.margin.top}, ${this.margin.left})`)
			.attr("width", this.width)
			.attr("height", this.height)
			.classed("mainGroup", true);
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

	private _brushChangeCallback : (data: pointWithImage[]) => void;
	public get brushChangeCallback() : (data: pointWithImage[]) => void {
		return this._brushChangeCallback;
	}


	public draw(): void
	{
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

		
		let brush = d3.brush()
			.extent([[-this.margin.left, -this.margin.top], [ this.width + this.margin.right, this.height + this.margin.bottom]])
			.on("start brush end", () => { this.brushHandler(); });
		this.mainGroupSelect.call(brush);
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
}
import * as d3 from 'd3';
import {SvgSelection} from '../../lib/DevLibTypes';
import {BaseWidget} from './BaseWidget';
import {PointCollection} from '../../DataModel/PointCollection';
import {PointND} from '../../DataModel/PointND';

export class ScatterPlotWidget extends BaseWidget<PointCollection> {
	
	constructor(container: HTMLElement, xKey: string, yKey: string)
	{
		super(container);
		this._xKey = xKey;
		this._yKey = yKey;
		// this.afterInit();
	}

	private _xKey : string;
	public get xKey() : string {
		return this._xKey;
	}

	private _yKey : string;
	public get yKey() : string {
		return this._yKey;
	}

	private _svgSelect : SvgSelection;
	public get svgSelect() : SvgSelection {
		return this._svgSelect;
	}

	private _mainGroupSelect : SvgSelection;
	public get mainGroupSelect() : SvgSelection {
		return this._mainGroupSelect;
	}

	private _xAxisGroupSelect : SvgSelection;
	public get xAxisGroupSelect() : SvgSelection {
		return this._xAxisGroupSelect;
	}

	private _xLabelTextSelect : SvgSelection;
	public get xLabelTextSelect() : SvgSelection {
		return this._xLabelTextSelect;
	}


	private _yAxisGroupSelect : SvgSelection;
	public get yAxisGroupSelect() : SvgSelection {
		return this._yAxisGroupSelect;
	}

	private _yLabelTextSelect : SvgSelection;
	public get yLabelTextSelect() : SvgSelection {
		return this._yLabelTextSelect;
	}

	private _scaleX : d3.ScaleLinear<number, number>;
	public get scaleX() : d3.ScaleLinear<number, number> {
		return this._scaleX;
	}

	private _scaleY : d3.ScaleLinear<number, number>;
	public get scaleY() : d3.ScaleLinear<number, number> {
		return this._scaleY;
	}

	// protected setMargin(): void
	// {
	// 	this._margin = {
	// 		top: 12,
	// 		right: 12,
	// 		bottom: 8,
	// 		left: 8
	// 	}
	// }

	public init(): void
	{
		// console.log('init');
		console.log(this.width);
		console.log(this.height);
		this._svgSelect = d3.select(this.container).append("svg")
			.attr("width", this.width)
			.attr("height", this.height);
		// console.log(this.svgSelect);
		this._mainGroupSelect = this.svgSelect.append("g")
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
		
		this._xAxisGroupSelect = this.svgSelect.append('g')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.vizHeight})`);

		this._yAxisGroupSelect = this.svgSelect.append('g')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
	}

	// private afterInit(): void
	// {
	// 	this.container.textContent = this.xKey + ", " + this.yKey;
	// }

	public OnDataChange()
	{
		this.updateScales();
		console.log("on data change...");
		this.mainGroupSelect.selectAll("circle")
			.data<PointND>(this.data.Array)
		  .join("circle")
			.attr("cx", d => this.scaleX(d.get(this.xKey)))
			.attr("cy", d => this.scaleY(d.get(this.yKey)))
			// .attr("r", 1)
			.classed("scatterPoint", true);
	}

	private updateScales(): void
	{
		let minMaxX = this.data.getMinMax(this.xKey);
		this._scaleX = d3.scaleLinear()
			.domain(minMaxX)
			.range([0, this.vizWidth]);

		let minMaxY = this.data.getMinMax(this.yKey);
		this._scaleY = d3.scaleLinear()
			.domain(minMaxY)
			.range([this.vizHeight, 0]);
	}

	protected OnResize(): void
	{
		// resize is handled by css / HTML
	}


}
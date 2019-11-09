import * as d3 from 'd3';
import {BaseWidget} from './BaseWidget';
import {CurveList} from '../../DataModel/CurveList';
import {PointND} from '../../DataModel/PointND';
import {Margin, SvgSelection} from '../../lib/DevLibTypes';

export class Plot2dPathsWidget extends BaseWidget<CurveList> {
	
	// constructor(container: Element)
	// {
	// 	super(container);
	// }

	private _vizWidth : number;
	public get vizWidth() : number {
		return this._vizWidth;
	}

	private _vizHeight : number;
	public get vizHeight() : number {
		return this._vizHeight;
	}

	private _margin : Margin;
	public get margin() : Margin {
		return this._margin;
	}

	private _svgSelect : SvgSelection;
	public get svgSelect() : SvgSelection {
		return this._svgSelect;
	}

	private _mainGroupSelect : SvgSelection;
	public get mainGroupSelect() : SvgSelection {
		return this._mainGroupSelect;
	}

	private _scaleX : d3.ScaleLinear<number, number>;
	public get scaleX() : d3.ScaleLinear<number, number> {
		return this._scaleX;
	}

	private _scaleY : d3.ScaleLinear<number, number>;
	public get scaleY() : d3.ScaleLinear<number, number> {
		return this._scaleY;
	}

	protected init(): void
	{
		this._margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		}
		this._svgSelect = d3.select(this.container).append("svg")
		this._mainGroupSelect = this.svgSelect.append("g");
		this.mainGroupSelect
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
		this.setVizWidthHeight();

		this.svgSelect.attr("style", 'background: lightblue; width: 100%; height: 100%;');
	}

	private setVizWidthHeight(): void
	{
		this._vizWidth = this.width - this.margin.left - this.margin.right;
		this._vizHeight = this.height - this.margin.top - this.margin.bottom;
	}

	public OnDataChange(): void
	{
		// console.log(this.data);
		this.updateScales();
		let line = d3.line<PointND>()
			.x((d, i) => { return this.scaleX(d.get("x")) })
			.y((d) => { return this.scaleY(d.get("y")) });

		// this.mainGroupSelect.html(null); //todo - shouldn't need this

		this.mainGroupSelect.selectAll("path")
			.data(this.data.curveList)
			.join("path")
			.attr("d", d => line(d.pointList))
			.classed("trajectoryPath", true);
	}

	private updateScales(): void
	{
		this._scaleX = d3.scaleLinear()
			.domain(this.data.minMaxMap.get("x"))
			.range([0, this.vizWidth]);

		this._scaleY = d3.scaleLinear()
			.domain(this.data.minMaxMap.get("y"))
			.range([this.vizHeight, 0]);
	}

	protected OnResize(): void
	{
		this.setVizWidthHeight();
		this.OnDataChange();
	}




}
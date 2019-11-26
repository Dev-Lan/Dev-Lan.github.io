import * as d3 from 'd3';
import {BaseWidget} from './BaseWidget';
import {CurveList} from '../../DataModel/CurveList';
import {PointND} from '../../DataModel/PointND';
import {Margin, SvgSelection} from '../../lib/DevLibTypes';

export class Plot2dPathsWidget extends BaseWidget<CurveList> {
	
	constructor(container: Element, xKey: string, yKey: string)
	{
		super(container);
		this._xKey = xKey;
		this._yKey = yKey;
	}

	// private _vizWidth : number;
	// public get vizWidth() : number {
	// 	return this._vizWidth;
	// }

	// private _vizHeight : number;
	// public get vizHeight() : number {
	// 	return this._vizHeight;
	// }

	// private _margin : Margin;
	// public get margin() : Margin {
	// 	return this._margin;
	// }

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

	private _xKey : string;
	public get xKey() : string {
		return this._xKey;
	}

	private _yKey : string;
	public get yKey() : string {
		return this._yKey;
	}

	protected init(): void
	{
		this._svgSelect = d3.select(this.container).append("svg")
		this._mainGroupSelect = this.svgSelect.append("g");
		this.mainGroupSelect
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
		// this.setVizWidthHeight();

		this.svgSelect.attr("style", 'width: 100%; height: 100%;');
	}


	public OnDataChange(): void
	{
		this.updateScales();
		this.updatePaths();
	}

	private updateScales(): void
	{
		// this code keeps the data aspect ratio square and keeps it centered and as large
		// as possible in it's container
		let containerRatio = this.vizHeight / this.vizWidth;
		let [minX, maxX] = this.data.minMaxMap.get(this.xKey);
		let [minY, maxY] = this.data.minMaxMap.get(this.yKey);
		let dataRatio = (maxY - minY) / (maxX - minX);
		if (containerRatio > dataRatio)
		{
			this._scaleX = d3.scaleLinear()
				.domain([minX, maxX])
				.range([0, this.vizWidth]);

			let [scaledMinY, scaledMaxY] = [this.scaleX(minY), this.scaleX(maxY)]; 
			let dataLength = scaledMaxY - scaledMinY;
			let offset = (this.vizHeight - dataLength) / 2.0 - scaledMinY;

			this._scaleY = d3.scaleLinear()
				.domain([minY, maxY])
				.range([scaledMaxY + offset, scaledMinY + offset]);
		}
		else
		{
			this._scaleY = d3.scaleLinear()
				.domain([minY, maxY])
				.range([this.vizHeight, 0]);


			let [scaledMinX, scaledMaxX] = [this.scaleY(minX), this.scaleY(maxX)]; 
			let dataLength = scaledMaxX - scaledMinX;
			let offset = (this.vizWidth - dataLength) / 2.0 - scaledMinX;

			this._scaleX = d3.scaleLinear()
				.domain([minX, maxX])
				.range([scaledMaxX + offset, scaledMinX + offset]);
		}
	}

	private updatePaths(): void
	{
		let line = d3.line<PointND>()
			.x((d, i) => { return this.scaleX(d.get(this.xKey)) })
			.y((d) => { return this.scaleY(d.get(this.yKey)) })
			.defined(d => d.inBrush);

		this.mainGroupSelect.selectAll("path")
			.data(this.data.curveList)
			.join("path")
			.attr("d", d => line(d.pointList))
			.classed("trajectoryPath", true);
	}

	protected OnResize(): void
	{
		// this.setVizWidthHeight();
		if (this.data)
		{
			this.OnDataChange();
		}
	}

	public OnBrushChange(): void
	{
		this.updatePaths();
	}



}
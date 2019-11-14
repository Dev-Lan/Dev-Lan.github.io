import * as d3 from 'd3';
import {SvgSelection} from '../../lib/DevLibTypes';
import {BaseWidget} from './BaseWidget';
import {PointCollection} from '../../DataModel/PointCollection';
import {PointND} from '../../DataModel/PointND';

export class HistogramWidget extends BaseWidget<PointCollection> {
	
	constructor(container: HTMLElement, valueKey: string)
	{
		super(container);
		this._valueKey = valueKey;
	}

	private _valueKey : string;
	public get valueKey() : string {
		return this._valueKey;
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

	protected setMargin(): void
	{
		this._margin = {
			top: 8,
			right: 12,
			bottom: 8,
			left: 12
		}
	}

	public init(): void
	{
		this._svgSelect = d3.select(this.container).append("svg");
		this._mainGroupSelect = this.svgSelect.append("g")
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
	}

	public OnDataChange(): void
	{

		let count = Math.round(Math.sqrt(this.data.length));
		let minMax = this.data.getMinMax(this.valueKey);

		let x = d3.scaleLinear()
			.domain(minMax)
			.nice(count);

		let bins = d3.histogram<PointND, number>()
			.domain(x.domain() as [number, number])
			.thresholds(x.ticks(count))
			.value(d => d.get(this.valueKey))
			(this.data);
		// console.log(this.data);
		this.updateScales(bins);

		const singleWidth = 18;

		this.mainGroupSelect.selectAll("rect")
			.data(bins)
		  .join("rect")
		  	.classed("histogramBar", true)
			.attr("x", d =>
			{
				if (bins.length === 1)
				{
					return (this.vizWidth - singleWidth) / 2
				}
				return this.scaleX(d.x0);;
			})
			.attr("y", d => this.vizHeight - this.scaleY(d.length))
			.attr("width", (d) =>
			{
				let diff = this.scaleX(d.x1) - this.scaleX(d.x0);
				if (diff === 0)
				{
					diff = singleWidth;
				}
				return diff;
			})
			.attr("height", d => this.scaleY(d.length));

		// console.log(bins);
	}

	private updateScales(bins: d3.Bin<PointND, number>[]): void
	{
		// console.log(this.width, this.height);
		// console.log(this.vizWidth, this.vizHeight);
		// console.log("minmax");
		// console.log(minMax);
		// todo cache minmax in point collection

		let minBinBoundary = d3.min(bins, d => d.x0);
		let maxBinBoundary = d3.max(bins, d => d.x1);

		// let minMax = this.data.getMinMax(this.valueKey);
		this._scaleX = d3.scaleLinear<number, number>()
			.domain([minBinBoundary, maxBinBoundary])
			.range([0, this.vizWidth]);

		let biggestBinCount = d3.max(bins, d => d.length);
		this._scaleY = d3.scaleLinear<number, number>()
			.domain([0, biggestBinCount])
			.range([0, this.vizHeight]);
	}

	protected OnResize(): void
	{
		this.OnDataChange();
	}


}
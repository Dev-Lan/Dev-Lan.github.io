import * as d3 from 'd3';
import {SvgSelection} from '../../lib/DevLibTypes';

export class ColorScaleLegend {
	
	constructor(container: SvgSelection, callback: (brushRange: [number, number] | null) => any, width = 24, height = 400)
	{
		this._container = container;
		this._brushChangeCallback = callback;
		this._width = width;
		this._height = height;

		this._linearGradientSelect = this.container.append("defs").append("linearGradient")
			.attr("id", "gradient")
			.attr("x1", "0%")
			.attr("y1", "100%")
			.attr("x2", "0%")
			.attr("y2", "0%");

		this.container.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("fill", 'url("#gradient")')

		this.container.append("rect")
			.attr("width", width)
			.attr("height", 0)
			.attr("x", 0)
			.classed("shadedOutInLegend", true)

		this.container.append("rect")
			.attr("width", width)
			.attr("height", 0)
			.attr("x", 0)
			.classed("shadedOutInLegend", true)

		const axisLabelPad = 2;

		this._axisGroupSelect = this.container.append("g")
			.attr("transform", `translate(${width + axisLabelPad}, 0)`)

		this._brush = d3.brushY()
			.extent([[0, 0], [this.width, this.height]])
			.on("start brush end", () => { this.brushHandler() });
		this.container.call(this.brush);
	}

	private _container : SvgSelection;
	public get container() : SvgSelection {
		return this._container;
	}

	private _brush : d3.BrushBehavior<any>;
	public get brush() : d3.BrushBehavior<any> {
		return this._brush;
	}

	private _linearGradientSelect : SvgSelection;
	public get linearGradientSelect() : SvgSelection {
		return this._linearGradientSelect;
	}

	private _axisGroupSelect : SvgSelection;
	public get axisGroupSelect() : SvgSelection {
		return this._axisGroupSelect;
	}

	private _width : number;
	public get width() : number {
		return this._width;
	}

	private _height : number;
	public get height() : number {
		return this._height;
	}

	private _valueScale : d3.ScaleLinear<number, number>;
	public get valueScale() : d3.ScaleLinear<number, number> {
		return this._valueScale;
	}

	private _brushChangeCallback : (brushRange: [number, number] | null) => any;
	public get brushChangeCallback() : (brushRange: [number, number] | null) => any {
		return this._brushChangeCallback;
	}

	private _lastSelectionInValueSpace : [number, number] | null | undefined;
	public get lastSelectionInValueSpace() : [number, number] | null | undefined {
		return this._lastSelectionInValueSpace;
	}

	public onDataChange(colorScale: d3.ScaleSequential<string>, fromResize = false): void
	{
		this.showLegend();
		const steps = 100;
		let [minV, maxV] = colorScale.domain();
		let diff = maxV - minV;
		this.linearGradientSelect.html(null);
		for (let i = 0; i <= steps; i++)
		{
			let portion = i / steps;
			let lerpV = minV + diff * portion;
			let offset: string = (100 * portion) + "%";
			let color = colorScale(lerpV);
			this.linearGradientSelect.append("stop")
				.attr("offset", offset)
				.attr("stop-color", color)
				.attr("opacity", 1)
		}

		this._valueScale = d3.scaleLinear()
			.domain([minV, maxV])
			.range([this.height, 0])

		this.axisGroupSelect.call(d3.axisRight(this.valueScale).tickFormat(d3.format(".1e")));
		
		if (!fromResize)
		{
			this.moveBrush(null);
		}
	}

	public hideLegend(): void
	{
		this.container.classed('noDisp', true);
	}

	private showLegend(): void
	{
		this.container.classed('noDisp', false);
	}	

	private brushHandler(): void
	{
		console.log("brush handler");
		const selection: [number, number] | null  | undefined = d3.event.selection;
		let [minBound, maxBound] = [0, this.height];
		if (typeof selection === "undefined" || selection === null)
		{
			this.brushChangeCallback(null);
			this.updateShadedOutRegion(minBound, maxBound);
			return;
		}
		[minBound, maxBound] = selection;
		let minV = this.valueScale.invert(maxBound); // min value is at the highest y coordinate
		let maxV = this.valueScale.invert(minBound);
		this.brushChangeCallback([minV, maxV]);
		this.updateShadedOutRegion(minBound, maxBound);
	}

	private updateShadedOutRegion(minBound: number, maxBound: number): void
	{
		if (minBound === maxBound)
		{
			minBound = 0;
			maxBound = this.height;
		}
		this.container.selectAll(".shadedOutInLegend")
			.data<[number, number]>([[0, minBound], [maxBound, this.height]])
			.attr("y", d => d[0])
			.attr("height", d => d[1] - d[0]);
	}


	public updateSelection(newSelection: [number, number] | null | undefined): void
	{
		this._lastSelectionInValueSpace = newSelection;
	}

	public resetBrush(): void
	{
		this.moveBrush(this.lastSelectionInValueSpace);
	}

	private moveBrush(selection: [number, number] | null | undefined): void
	{
		if (typeof selection === "undefined" || selection === null)
		{
			this.container.call(this.brush.move, null);
			return;
		}
		let [minVal, maxVal] = selection;
		let maxPixel = this.valueScale(minVal);
		let minPixel = this.valueScale(maxVal);

 		this.container.call(this.brush.move, [minPixel, maxPixel]);
	}
}
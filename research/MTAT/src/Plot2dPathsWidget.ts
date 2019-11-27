import * as d3 from 'd3';
import {BaseWidget} from './BaseWidget';
import {CurveList} from '../../DataModel/CurveList';
import {PointND} from '../../DataModel/PointND';
import {Margin, SvgSelection, HtmlSelection} from '../../lib/DevLibTypes';

export class Plot2dPathsWidget extends BaseWidget<CurveList> {
	
	constructor(container: Element, xKey: string, yKey: string)
	{
		super(container);
		this._xKey = xKey;
		this._yKey = yKey;
		this._shouldRepeat = false;
		this._lastFrameTime = null;
	}

	private _svgSelect : SvgSelection;
	public get svgSelect() : SvgSelection {
		return this._svgSelect;
	}

	private _mainGroupSelect : SvgSelection;
	public get mainGroupSelect() : SvgSelection {
		return this._mainGroupSelect;
	}

	private _playControlsSelect : HtmlSelection;
	public get playControlsSelect() : HtmlSelection {
		return this._playControlsSelect;
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

	private _animationTime : number;
	public get animationTime() : number {
		return this._animationTime;
	}

	private _animating : boolean;
	public get animating() : boolean {
		return this._animating;
	}

	private _shouldRepeat : boolean;
	public get shouldRepeat() : boolean {
		return this._shouldRepeat;
	}

	private _lastFrameTime : number | null;
	public get lastFrameTime() : number | null {
		return this._lastFrameTime;
	}

	private _timeBound : [number, number];
	public get timeBound() : [number, number] {
		return this._timeBound;
	}

	protected init(): void
	{
		this._svgSelect = d3.select(this.container).append("svg")
		this._mainGroupSelect = this.svgSelect.append("g");
		this.mainGroupSelect
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

		this.svgSelect.attr("style", 'width: 100%; height: 100%;');

		this._playControlsSelect = d3.select(this.container).append("div")
			.classed("playControlsContainer", true);

		this.playControlsSelect.append("button")
			.text("play")
			.on("click", () =>
			{
				if (!this.animating)
				{
					this._animating = true;
					if (this.animationTime >= this.timeBound[1])
					{
						this._animationTime = this.timeBound[0];
					}
					window.requestAnimationFrame((ts: number) => this.animationStep(ts));
				}
			});

		this.playControlsSelect.append("button")
			.text("pause")
			.on("click", () =>
			{
				this._animating = false;
				this._lastFrameTime = null;
			});

		this.playControlsSelect.append("button")
			.text("repeat")
			.on("click", () =>
			{
				this._shouldRepeat = !this.shouldRepeat;
				// todo - modify button
				console.log("repeat");
			});
	}


	public OnDataChange(): void
	{
		// let [minTime, maxTime] = this.data.minMaxMap.get(this.data.inputKey);
		this._timeBound = this.data.minMaxMap.get(this.data.inputKey);
		this._animating = false;
		this._animationTime = this.timeBound[0];
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

	private animationStep(timestep: number): void
	{
		if (this.lastFrameTime === null)
		{
			this._lastFrameTime = timestep;
		}
		let elapsedTime = timestep - this.lastFrameTime;
		this._lastFrameTime = timestep;
		this._animationTime += (elapsedTime / 1000);

		if (this.animationTime > this.timeBound[1])
		{
			if (this.shouldRepeat)
			{
				let over = this.animationTime - this.timeBound[1];
				this._animationTime = this.timeBound[0] + over;
			}
			else
			{
				this._animationTime = this.timeBound[1];
				this._animating = false;
				this._lastFrameTime = null;
			}
		}

		let pointList: PointND[] = this.data.getPointsAtInput(this.animationTime);
		// console.log(this.animationTime);
		// console.log(pointList);



		this.mainGroupSelect.selectAll("circle")
			.data(pointList)
		  .join("circle")
			.attr("cx", d => this.scaleX(d.get(this.xKey)))
			.attr("cy", d => this.scaleY(d.get(this.yKey)))
			.attr("r", 3);

		if (this.animating)
		{
			window.requestAnimationFrame((ts: number) => this.animationStep(ts));
		}
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
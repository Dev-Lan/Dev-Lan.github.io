import * as d3 from 'd3';
import { Label, LabelPosition } from './types';
import { HtmlSelection } from '../../lib/DevLibTypes';

export class Overlay {
	
	constructor(containerId: string) {
		this._labelList = [];
		this._container = d3.select('#' + containerId);
		this.container.on("click", () => { this.advanceStory(); });
	}

	private _labelList : Label[];
	public get labelList() : Label[] {
		return this._labelList;
	}

	private _container : HtmlSelection;
	public get container() : HtmlSelection {
		return this._container;
	}

	private _currentIndex : number;
	public get currentIndex() : number {
		return this._currentIndex;
	}
	
	public clearLabels(): void
	{
		this._labelList = [];
	}

	public addLabel(anchorElement: Element, padSize: [number, number], position: LabelPosition, text: string, isOval: boolean, callBeforeNext?: Function)
	{
		let label: Label =
		{
			anchorElement: anchorElement,
			padSize: padSize,
			position: position,
			text: text,
			oval: isOval,
			callBeforeNext: callBeforeNext
		};
		this._labelList.push(label);
	}

	public showLabels(): void
	{
		let size: number = 4000;
		let [top, left] = this.getLabelTopLeft(0, size / 2);

		this.container.html(null);
		this.container.classed("noDisp", false);

		this.container.append("div")
			.attr("id", "innerOverlay")
			.attr("style",
				`
					width: ${size}px;
					height: ${size}px;
					top: ${top}px;
					left: ${left}px;
					border-radius: 10000px;
				`)
			.classed("innerOverlay", true)
			.classed("overlay", true);

		this.container.append("div")
			.attr("id", "outerOverlay")
			.attr("style",
				`
					width: ${size}px;
					height: ${size}px;
					top: ${top}px;
					left: ${left}px;
					border-radius: 10000px;
				`)
			.classed("outerOverlay", true)
			.classed("overlay", true);

		this.container.append("div")
			.attr("id", "labelContainer")
			.classed("labelContainer", true);

		this.switchToLabel(0);
	}

	private switchToLabel(index: number): void
	{
		const transitionLength = 1000;
		this._currentIndex = index;
		this.checkLabelBound(index);
		let label = this.labelList[index];
		let [padWidth, padHeight] = label.padSize;
		let [width, height] = this.getLabelSize(index);
		width += padWidth;
		height += padHeight;
		let [top, left] = this.getLabelTopLeft(index);
		let cornerRoundAmount: number;
		if (label.oval)
		{
			cornerRoundAmount = Math.min(width, height) / 2;
		}
		else
		{
			cornerRoundAmount = 10;
		}
		this.container.selectAll(".overlay")
			.transition()
			.duration(transitionLength)
			.attr("style",
				`
					width: ${width}px;
					height: ${height}px;
					top: ${top}px;
					left: ${left}px;
					border-radius: ${cornerRoundAmount}px;
				`);

		const labelWidth = 220; // from css
		const padding = 30;
		let labelTop: number;
		let labelLeft: number;
		const maxLabelWidth = 200; //defined in css
		switch (label.position) {
			case LabelPosition.Right:
				labelTop = top;
				labelLeft = left + width + padding;
				break;
			case LabelPosition.Bottom:
				labelTop = top + height + padding;
				labelLeft = left + (width - labelWidth) / 2;
				break;
			case LabelPosition.Left:
				labelTop = top;
				labelLeft = left - maxLabelWidth - padding
				break;
		}

		this.container.select("#labelContainer")
			.attr("style",
				`
					top: ${labelTop}px;
					left: ${labelLeft}px;
					opacity: 0;
				`)
			.html(label.text)
			.transition()
			.delay(transitionLength)
			.attr("style",
				`
					top: ${labelTop}px;
					left: ${labelLeft}px;
					opacity: 0.9;
				`)
	}

	private getLabelTopLeft(index: number, otherRadius?: number): [number, number]
	{
		this.checkLabelBound(index);
		let label = this.labelList[index];
		let width: number;
		let height: number;
		if (otherRadius)
		{
			width = otherRadius;
			height = otherRadius;
		}
		else
		{
			let [padWidth, padHeight] = label.padSize;
			[width, height] = this.getLabelSize(index);
			width += padWidth;
			height += padHeight;
		}
		let [x, y] = this.getLabelCenter(index);
		let top: number = y - height / 2;
		let left: number = x - width / 2;
		return [top, left];
	}

	private getLabelCenter(index: number): [number, number]
	{
		this.checkLabelBound(index);
		let label = this.labelList[index];
		const bbox: ClientRect = label.anchorElement.getBoundingClientRect();
		let x = bbox.left + bbox.width / 2;
		let y = bbox.top + bbox.height / 2;
		return [x, y];
	}

	private getLabelSize(index: number): [number, number]
	{
		this.checkLabelBound(index);
		let label = this.labelList[index];
		const bbox: ClientRect = label.anchorElement.getBoundingClientRect();
		return [bbox.width, bbox.height];
	}



	private advanceStory(): void
	{
		let currentLabel = this.labelList[this.currentIndex];
		if (currentLabel && currentLabel.callBeforeNext)
		{
			currentLabel.callBeforeNext();
		}
		if (this.currentIndex >= this.labelList.length - 1)
		{
			this.hideLabels();
			return;
		}
		this.switchToLabel(this.currentIndex + 1);
	}

	private checkLabelBound(index: number): void
	{
		if (index < 0 || index >= this._labelList.length)
		{
			throw `Label [${index}] does not exist`;
		}
	}


	public hideLabels(): void
	{
		this.container.html(null);
		this.container.classed("noDisp", true);
	}
}
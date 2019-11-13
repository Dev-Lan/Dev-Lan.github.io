import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {BaseWidget} from './BaseWidget';
import {PointCollection} from '../../DataModel/PointCollection';
import {LayoutFramework} from './LayoutFramework';
import {Frame, MetricDistributionSubComponentTypes, Direction} from './types';

export class MetricDistributionWidget extends BaseWidget<PointCollection> {
	

	private _wrapperContainer : HTMLDivElement;
	public get wrapperContainer() : HTMLDivElement {
		return this._wrapperContainer;
	}

	private _layoutFramework : LayoutFramework;
	public get layoutFramework() : LayoutFramework {
		return this._layoutFramework;
	}

	private _subComponentLookup : Map<HTMLElement, MetricDistributionSubComponentTypes>;
	public get subComponentLookup() : Map<HTMLElement, MetricDistributionSubComponentTypes> {
		return this._subComponentLookup;
	}

	private _basisSelectContainerSelection : HtmlSelection;
	public get basisSelectContainerSelection() : HtmlSelection {
		return this._basisSelectContainerSelection;
	}

	protected init(): void
	{
		this._wrapperContainer = document.createElement("div");
		this.wrapperContainer.classList.add("frame", "dir-row", "wrapperContainer");
		this.container.appendChild(this.wrapperContainer);

		this._layoutFramework = new LayoutFramework(this.wrapperContainer);
		let layout: Frame<MetricDistributionSubComponentTypes> = {
			direction: Direction.row,
			inside: [
				{
					direction: Direction.column,
					minSize: 80,
					maxSize: 80,
					inside: MetricDistributionSubComponentTypes.BasisSelect
				},
				{
					direction: Direction.column,
					minSize: 160,
					maxSize: 160,
					inside: MetricDistributionSubComponentTypes.ScatterplotSelect
				},
				{
					direction: Direction.column,
					inside: MetricDistributionSubComponentTypes.DistributionPlot
				},
				{
					direction: Direction.column,
					inside: MetricDistributionSubComponentTypes.Scatterplot
				}
			]
		};
		this._subComponentLookup = this.layoutFramework.InitializeLayout<MetricDistributionSubComponentTypes>(layout)
		this.initSubComponents();
	}

	private initSubComponents(): void
	{
		for (let [container, subComponent] of this.subComponentLookup)
		{
			switch (subComponent) {
				case MetricDistributionSubComponentTypes.BasisSelect:
					this._basisSelectContainerSelection = d3.select(container);
					break;
				case MetricDistributionSubComponentTypes.ScatterplotSelect:
					this.initScatterplotSelect(container);
					break;
				case MetricDistributionSubComponentTypes.DistributionPlot:
					this.initDistributionPlot(container);
					break;
				case MetricDistributionSubComponentTypes.Scatterplot:
					this.initScatterplot(container);
					break;
				default:
					break;
			}
		}
	}

	private initScatterplotSelect(container: Element): void
	{
		(container as HTMLElement).style.border = "solid green 2px";

	}

	private initDistributionPlot(container: Element): void
	{
		(container as HTMLElement).style.border = "solid blue 2px";
	}

	private initScatterplot(container: Element): void
	{
		(container as HTMLElement).style.border = "solid orange 2px";
	}


	public OnDataChange(): void
	{
		this.drawBasisSelect();
	}

	private drawBasisSelect(): void
	{
		let thisWidget = this;
		this.basisSelectContainerSelection
			.selectAll("button")
			.data(this.data.attributeList)
			.join("button")
			.text(d => d)
			.classed("toggleButton", true)
			.classed("on", true)
			.on('click', function(d)
			{
				let buttonSelect = d3.select(this);
				let turnOn = !buttonSelect.classed("on");
				buttonSelect.classed("on", turnOn);
				console.log(d, turnOn);
			});
	}

	protected OnResize(): void
	{
		// do nothing css / HTML should handle resize
	}


}
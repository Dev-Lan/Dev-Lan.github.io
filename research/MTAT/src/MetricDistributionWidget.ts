import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {BaseWidget} from './BaseWidget';
import {PointCollection} from '../../DataModel/PointCollection';
import {LayoutFramework} from './LayoutFramework';
import {HistogramWidget} from './HistogramWidget';
import {Frame, MetricDistributionSubComponentTypes, Direction} from './types';

interface boolWithIndex {
	value: boolean,
	rowIndex: number,
}

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

	private _scatterPlotSelectContainerSelection : HtmlSelection;
	public get scatterPlotSelectContainerSelection() : HtmlSelection {
		return this._scatterPlotSelectContainerSelection;
	}

	private _distributionPlotContainerSelection : HtmlSelection;
	public get distributionPlotContainerSelection() : HtmlSelection {
		return this._distributionPlotContainerSelection;
	}

	private _basisSelectionBooleans : boolean[];
	public get basisSelectionBooleans() : boolean[] {
		return this._basisSelectionBooleans;
	}

	private _scatterplotSelectionBooleans : boolWithIndex[][];
	public get scatterplotSelectionBooleans() : boolWithIndex[][] {
		return this._scatterplotSelectionBooleans;
	}

	private _histogramWidgets : HistogramWidget[];
	public get histogramWidgets() : HistogramWidget[] {
		return this._histogramWidgets;
	}

	// private _containerToVizMap : ;
	// public get containerToVizMap() :  {
	// 	return this._containerToVizMap;
	// }
	// public set containerToVizMap(v : ) {
	// 	this._containerToVizMap = v;
	// }

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
					this._basisSelectContainerSelection = d3.select(container)
						.append("div")
						.classed("overflow-scroll", true)
						.classed("toggleButtonContainer", true);
					this.basisSelectContainerSelection.node().style.maxHeight = this.height + "px";
					break;
				case MetricDistributionSubComponentTypes.ScatterplotSelect:
					this._scatterPlotSelectContainerSelection = d3.select(container)
						.append("div")
						.classed("overflow-scroll", true)
						.classed("matrixContainer", true);
					this.scatterPlotSelectContainerSelection.node().style.maxHeight = this.height + "px";
					break;
				case MetricDistributionSubComponentTypes.DistributionPlot:
					this._distributionPlotContainerSelection = d3.select(container)
						.append("div")
						.classed("distributionPlotContainer", true)
						.classed("overflow-scroll", true);
					this.distributionPlotContainerSelection.node().style.maxHeight = this.height + "px";
					// this.initDistributionPlot(container);
					break;
				case MetricDistributionSubComponentTypes.Scatterplot:
					this.initScatterplot(container);
					break;
				default:
					break;
			}
		}
	}

	private initScatterplot(container: HTMLElement): void
	{
		container.style.border = "solid orange 2px";
	}

	public OnDataChange(): void
	{
		this.updateUIData();
		this.drawBasisSelect();
		this.drawScatterPlotSelectContainerSelection();
		this.drawDistributionPlot();
	}

	private updateUIData(): void
	{
		this._basisSelectionBooleans = [];

		this._scatterplotSelectionBooleans = [];
		for (let [index, attr1] of this.data.attributeList.entries())
		{
			this.basisSelectionBooleans.push(true);
			let row: boolWithIndex[] = [];
			for (let attr2 of this.data.attributeList)
			{
				row.push({
					value: attr1 === attr2,
					rowIndex: index
					});
			}
			this.scatterplotSelectionBooleans.push(row);
		}
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
			.classed("on", (d, i) => this.basisSelectionBooleans[i])
			.on('click', function(d, i)
			{
				let buttonSelect = d3.select(this);
				let turnOn = !thisWidget.basisSelectionBooleans[i];
				buttonSelect.classed("on", turnOn);
				thisWidget.basisSelectionBooleans[i] = turnOn;
				thisWidget.drawScatterPlotSelectContainerSelection();
				thisWidget.drawDistributionPlot();
			});
	}

	private drawScatterPlotSelectContainerSelection(): void
	{
		let thisWidget = this;
		this.scatterPlotSelectContainerSelection
			.selectAll("div")
			.data(this.scatterplotSelectionBooleans)
		  .join("div")
			.classed("rowContainer", true)
			.classed("noDisp", (d, i) => !thisWidget.basisSelectionBooleans[i] )
			.selectAll("button")
			.data(d => d)
		  .join("button")
		  	.classed("squareButton", true)
		  	.classed("on", d=> d.value)
		  	.classed("noDisp", (d, i) => !thisWidget.basisSelectionBooleans[i])
			.on("click", function(d, i)
			{
				let buttonSelect = d3.select(this);
				let turnOn = !d.value;
				buttonSelect.classed("on", turnOn);
				thisWidget.scatterplotSelectionBooleans[d.rowIndex][i].value = turnOn;
				thisWidget.drawDistributionPlot(); // todo only if diagonal
			});
	}

	private clearWidgets(): void
	{
		this.children.splice(0, this.children.length);
	}

	private drawDistributionPlot(): void
	{
		this.clearWidgets();
		let thisWidget = this;
		this._histogramWidgets = [];
		this.distributionPlotContainerSelection.html(null)
			.selectAll("div")
			.data(this.data.attributeList)
			.join("div")
			.classed("histogramContainer", true)
			.classed("noDisp", (d, i) => 
				{
					if (!this.basisSelectionBooleans[i])
					{
						return true;
					}
					return !this.scatterplotSelectionBooleans[i][i].value;
				})
			.each(function(d)
			{
				let container = this as HTMLDivElement;
				let newWidget = new HistogramWidget(container, d);
				thisWidget.children.push(newWidget);
				newWidget.SetData(thisWidget.data)
			});
	}

	protected OnResize(): void
	{
		this.basisSelectContainerSelection.node().style.maxHeight = this.height + "px"
		this.scatterPlotSelectContainerSelection.node().style.maxHeight = this.height + "px"
		this.distributionPlotContainerSelection.node().style.maxHeight = this.height + "px"
	}


}
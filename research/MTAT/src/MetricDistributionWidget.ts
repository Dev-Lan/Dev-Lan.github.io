import * as d3 from 'd3';
import {HtmlSelection} from '../../lib/DevLibTypes';
import {BaseWidget} from './BaseWidget';
import {PointCollection} from '../../DataModel/PointCollection';
import {LayoutFramework} from './LayoutFramework';
import {HistogramWidget} from './HistogramWidget';
import {ScatterPlotWidget} from './ScatterPlotWidget';
import {Frame, MetricDistributionSubComponentTypes, Direction} from './types';

interface boolWithIndex {
	value: boolean,
	index: [number, number],
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

	private _yAxisMatrixSelect : HtmlSelection;
	public get yAxisMatrixSelect() : HtmlSelection {
		return this._yAxisMatrixSelect;
	}

	private _xAxisMatrixSelect : HtmlSelection;
	public get xAxisMatrixSelect() : HtmlSelection {
		return this._xAxisMatrixSelect;
	}

	private _distributionPlotContainerSelection : HtmlSelection;
	public get distributionPlotContainerSelection() : HtmlSelection {
		return this._distributionPlotContainerSelection;
	}

	private _scatterPlotContainerSelection : HtmlSelection;
	public get scatterPlotContainerSelection() : HtmlSelection {
		return this._scatterPlotContainerSelection;
	}

	private _attributeToIndex : Map<string, number>;
	public get attributeToIndex() : Map<string, number> {
		return this._attributeToIndex;
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

	private _scatterPlotWidgets : ScatterPlotWidget[];
	public get scatterPlotWidgets() : ScatterPlotWidget[] {
		return this._scatterPlotWidgets;
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
					this._basisSelectContainerSelection = this.initSubComponent(container, "toggleButtonContainer");
					break;
				case MetricDistributionSubComponentTypes.ScatterplotSelect:
					let wrapper = d3.select(container).append('div')
						.classed("matrixWrapperContainer", true);
					this._yAxisMatrixSelect = this.initSubComponent(wrapper.node(), "yAxisMatrixContainer");
						
					let rightWrapper = wrapper.append('div')
						.classed("matrixRightWrapperContainer", true);

					this._scatterPlotSelectContainerSelection = this.initSubComponent(rightWrapper.node(), "matrixContainer");
					this._xAxisMatrixSelect = this.initSubComponent(rightWrapper.node(), "xAxisMatrixContainer");
					break;
				case MetricDistributionSubComponentTypes.DistributionPlot:
					this._distributionPlotContainerSelection = this.initSubComponent(container, "distributionPlotContainer");
					break;
				case MetricDistributionSubComponentTypes.Scatterplot:
					this._scatterPlotContainerSelection = this.initSubComponent(container, "scatterPlotOuterContainer");
					break;
				default:
					break;
			}
		}
		this.resizeSubComponents();
	}

	private initSubComponent(container: HTMLElement, className: string): HtmlSelection
	{
		return d3.select(container)			
			.append("div")
			.classed(className, true)
			.classed("overflow-scroll", true);
	}

	public OnDataChange(): void
	{
		this._attributeToIndex = new Map<string, number>();
		for (let [index, attr] of this.data.attributeList.entries())
		{
			this.attributeToIndex.set(attr, index);
		}

		this.updateUIData();
		this.drawBasisSelect();
		this.drawScatterPlotSelectContainerSelection();
		this.drawMatrixAxis();
		this.drawHistograms();
		this.drawScatterPlots(this.getScatterOptionsMatrix());
	}

	private updateUIData(): void
	{
		this._basisSelectionBooleans = [];

		const maxDefaultMatrixSize = 15
		this._scatterplotSelectionBooleans = [];
		for (let [rowIndex, attr1] of this.data.attributeList.entries())
		{
			this.basisSelectionBooleans.push(rowIndex < maxDefaultMatrixSize);
			let row: boolWithIndex[] = [];
			for (let [colIndex, attr2] of this.data.attributeList.entries())
			{
				row.push({
					value: attr1 === attr2,
					index: [rowIndex, colIndex]
					});
			}
			this.scatterplotSelectionBooleans.push(row);
		}
		this.drawBasisSelect();
	}

	private drawBasisSelect(): void
	{
		let thisWidget = this;
		let flatData = this.getScatterOptionsMatrix();
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
				thisWidget.drawMatrixAxis();
				thisWidget.updateHistograms();
				thisWidget.updateScatterPlots(flatData);
			});
	}

	private drawMatrixAxis(): void
	{
		const buttonWidth = 80;
		const buttonHeight = 18;
		let options = this.data.attributeList.filter((d, i) => this.basisSelectionBooleans[i]);
		this.yAxisMatrixSelect.selectAll("button")
			.data(options)
		  .join("button")
			.classed('axisButton', true)
			.classed('y', true)
			.attr("style", (d, i) => `
				width: ${buttonWidth}px;
				height: ${buttonHeight}px;`)
			.text(d => d)
			.on("click", (d) => {
				let rowIndex = this.attributeToIndex.get(d);
				let row: boolWithIndex[] = this.scatterplotSelectionBooleans[rowIndex];
				let allTrue = true;
				for (let cell of row)
				{
					if (this.basisSelectionBooleans[cell.index[1]])
					{
						if (!cell.value)
						{
							allTrue = false;
						}
						cell.value = true;
					}
				}
				if (allTrue)
				{
					for (let cell of row)
					{
						if (this.basisSelectionBooleans[cell.index[1]])
						{
							cell.value = false;
						}
					}
				}

				this.afterMultipleMatrixChanges();
			});


		const halfWidth = buttonWidth / 2; 
		const rotate = -90;
		const theta = Math.PI * rotate / 180;
		const xOffset = -0.5 * (buttonWidth + buttonWidth * Math.cos(-theta) + buttonHeight * Math.sin(-theta));
		const yOffset = 0.5 * (buttonWidth * Math.sin(-theta) + buttonHeight * Math.cos(-theta) - buttonHeight);

		let theta2 = 90 + rotate;
		theta2 = Math.PI * theta2 / 180;
		const horizontalPadding = 2;
		let stepSize = horizontalPadding + buttonHeight / Math.cos(theta2);


		this.xAxisMatrixSelect.selectAll("button")
			.data(options)
		  .join("button")
			.classed('axisButton', true)
			.classed('x', true)
			.attr("style", (d, i) => `
				width: ${buttonWidth}px;
				height: ${buttonHeight}px;
				transform: translate( ${stepSize * (i + 1) + xOffset}px, ${yOffset}px) rotate(${rotate}deg);`)
			.text(d => d)
			.on("click", (d) => {
				let colIndex = this.attributeToIndex.get(d);
				let allTrue = true;
				for (let row of this.scatterplotSelectionBooleans)
				{
					for (let cell of row)
					{
						let cellRowIndex = cell.index[0];
						let cellColIndex = cell.index[1];

						if (colIndex === cellColIndex && this.basisSelectionBooleans[cellRowIndex])
						{
							if (!cell.value)
							{
								allTrue = false;
							}
							cell.value = true;
						}
					}
				}

				if (allTrue)
				{
					for (let row of this.scatterplotSelectionBooleans)
					{
						for (let cell of row)
						{
							let cellRowIndex = cell.index[0];
							let cellColIndex = cell.index[1];

							if (colIndex === cellColIndex && this.basisSelectionBooleans[cellRowIndex])
							{
								cell.value = false;
							}
						}
					}
				}
				
				this.afterMultipleMatrixChanges();
			});
	}

	private afterMultipleMatrixChanges(): void
	{
		this.updateMatrixCellSelections();
		let flatData = this.getScatterOptionsMatrix()
		this.updateHistograms();
		this.updateScatterPlots(flatData);
	}

	private updateMatrixCellSelections(): void
	{
		this.scatterPlotSelectContainerSelection
			.selectAll("div")
			.data(this.scatterplotSelectionBooleans)
		  .join("div")
			.selectAll("button")
			.data(d => d)
		  .join("button")
		  	.classed("on", d=> d.value);
	}

	private drawScatterPlotSelectContainerSelection(): void
	{
		let thisWidget = this;
		let flatData = this.getScatterOptionsMatrix();
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
				thisWidget.scatterplotSelectionBooleans[d.index[0]][i].value = turnOn;
				if (i === d.index[0])
				{
					thisWidget.updateHistograms();
				}
				else
				{
					thisWidget.updateScatterPlots(flatData);
				}
			});
	}

	private drawHistograms(): void
	{
		let thisWidget = this;
		this._histogramWidgets = [];
		this.distributionPlotContainerSelection.html(null)
			.selectAll("div")
			.data(this.data.attributeList)
			.join("div")
			.classed("histogramContainer", true)
			.each(function(d)
			{
				let container = this as HTMLDivElement;
				let newWidget = new HistogramWidget(container, d);
				thisWidget.histogramWidgets.push(newWidget);
			});
		this.updateHistograms();
	}

	
	private updateHistograms(): void
	{
		let thisWidget = this;
		// this._histogramWidgets = [];
		this.distributionPlotContainerSelection
			.selectAll("div")
			.data(this.data.attributeList)
			// .join("div")
			.classed("histogramContainer", true)
			.classed("noDisp", (d, i) => this.shouldHide(i))
			.each(function(d, i)
			{
				let container = this as HTMLDivElement;
				// let newWidget = new HistogramWidget(container, d);
				// newWidget.SetData(thisWidget.data)
				// console.log(d, i);
				// console.log(thisWidget);
				let histogramWidget = thisWidget.histogramWidgets[i];
				// console.log(histogramWidget);
				if (!thisWidget.shouldHide(i) && !histogramWidget.data)
				{
					histogramWidget.SetData(thisWidget.data)
				}
			});
	}



	private getScatterOptionsMatrix(): boolWithIndex[]
	{
		let flatData = this.scatterplotSelectionBooleans.flat();
		flatData = flatData.filter(d => d.index[0] !== d.index[1]);
		return flatData;
	}

	private drawScatterPlots(flatData: boolWithIndex[]): void
	{
		this._scatterPlotWidgets = [];
		let thisWidget = this;

		this.scatterPlotContainerSelection.html(null)
			.selectAll("div")
			.data(flatData)
			.join("div")
			.classed("scatterPlotContainer", true)
			.each(function(d)
			{
				let container = this as HTMLDivElement;
				let xKey = thisWidget.data.attributeList[d.index[1]];
				let yKey = thisWidget.data.attributeList[d.index[0]];
				let newWidget = new ScatterPlotWidget(container, xKey, yKey);
				thisWidget.scatterPlotWidgets.push(newWidget);
			});
		this.updateScatterPlots(flatData);
	}

	private updateScatterPlots(flatData: boolWithIndex[]): void
	{
		let thisWidget = this;

		this.scatterPlotContainerSelection
			.selectAll("div")
			.data(flatData)
			.classed("noDisp", (d) => this.shouldHide(d))
			.each(function(d, i)
			{
				let scatterWidget = thisWidget.scatterPlotWidgets[i];
				if (!thisWidget.shouldHide(d) && !scatterWidget.data)
				{
					scatterWidget.SetData(thisWidget.data)
				}
			});
	}

	private shouldHide(d: boolWithIndex | number): boolean
	{
		if (typeof d === "number")
		{
			if (!this.basisSelectionBooleans[d])
			{
				return true;
			}
			return !this.scatterplotSelectionBooleans[d][d].value;

		}
		if (!this.basisSelectionBooleans[d.index[0]] || !this.basisSelectionBooleans[d.index[1]])
		{
			return true;
		}
		return !d.value;
	}

	protected OnResize(): void
	{
		this.resizeSubComponents();
		// for ()
	}

	private resizeSubComponents(): void
	{
		this.basisSelectContainerSelection.node().style.maxHeight = this.height + "px"
		this.scatterPlotSelectContainerSelection.node().style.maxHeight = this.height + "px"
		this.distributionPlotContainerSelection.node().style.maxHeight = this.height + "px"
		this.scatterPlotContainerSelection.node().style.maxHeight = this.height + "px"
	}

}
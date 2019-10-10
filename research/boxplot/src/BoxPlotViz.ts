import { BoxPlotData, ScaleType, OutlierMethod } from "./BoxPlotData";
import { FunctionData } from "./FunctionData"
import * as d3 from 'd3';

interface Margin {
	top: number,
	right: number,
	bottom: number,
	left: number
}

interface CellProperties {
	cellText: string,
	extraClass: string
}

type SvgSelection = d3.Selection<SVGElement, any, HTMLElement, any>;

export class BoxPlotViz {
	
	constructor() {
		this._margin = {
			top: 10,
			right: 50,
			bottom: 50,
			left: 50
		};
		this._bandWidthValueDisplay = document.getElementById("bandWidthValue");
		this._outlierThresholdValueDisplay = document.getElementById("outlierThresholdValue");
		this._xSymConstantValueDisplay = document.getElementById("xSymLogConstantDisplay");
		this._ySymConstantValueDisplay = document.getElementById("ySymLogConstantDisplay");
		this._selectedColorOptions = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00']; // from -- http://colorbrewer2.org/#
		this._lastSelectedColorIndex = -1;
	}

	private _data : BoxPlotData;
	public get data() : BoxPlotData {
		return this._data;
	}

	private _tableContainer : HTMLElement;
	public get tableContainer() : HTMLElement {
		return this._tableContainer;
	}

	private _tableSelectedContainer : HTMLElement;
	public get tableSelectedContainer() : HTMLElement {
		return this._tableSelectedContainer;
	}

	// private _vizWrapper : HTMLElement;
	// public get vizWrapper() : HTMLElement {
	// 	return this._vizWrapper;
	// }

	private _tableValueContainer : HTMLElement;
	public get tableValueContainer() : HTMLElement {
		return this._tableValueContainer;
	}

	private _svgContainer: SVGElement;
	public get svgContainer(): SVGElement {
		return this._svgContainer;
	}

	private _margin : Margin;
	public get margin() : Margin {
		return this._margin;
	}

	private _graphWidth : number;
	public get graphWidth() : number {
		return this._graphWidth;
	}

	private _graphHeight : number;
	public get graphHeight() : number {
		return this._graphHeight;
	}

	private _xScale : d3.ScaleContinuousNumeric<number, number>;
	public get xScale() : d3.ScaleContinuousNumeric<number, number> {
		return this._xScale;
	}

	private _yScale : d3.ScaleContinuousNumeric<number, number>;
	public get yScale() : d3.ScaleContinuousNumeric<number, number> {
		return this._yScale;
	}

	private _bandWidthValueDisplay : HTMLElement;
	public get bandWidthValueDisplay() : HTMLElement {
		return this._bandWidthValueDisplay;
	}

	private _outlierThresholdValueDisplay : HTMLElement;
	public get outlierThresholdValueDisplay() : HTMLElement {
		return this._outlierThresholdValueDisplay;
	}

	private _xSymConstantValueDisplay : HTMLElement;
	public get xSymConstantValueDisplay() : HTMLElement {
		return this._xSymConstantValueDisplay;
	}

	private _ySymConstantValueDisplay : HTMLElement;
	public get ySymConstantValueDisplay() : HTMLElement {
		return this._ySymConstantValueDisplay;
	}

	private _rawFunctionLineGrouper : SvgSelection;
	public get rawFunctionLineGrouper() : SvgSelection {
		return this._rawFunctionLineGrouper;
	}

	private _boxPlotLineGrouper : SvgSelection;
	public get boxPlotLineGrouper() : SvgSelection {
		return this._boxPlotLineGrouper;
	}

	private _selectedFunctionsLineGrouper : SvgSelection;
	public get selectedFunctionsLineGrouper() : SvgSelection {
		return this._selectedFunctionsLineGrouper;
	}

	private _selectedColorOptions : string[];
	public get selectedColorOptions() : string[] {
		return this._selectedColorOptions;
	}

	private _lastSelectedColorIndex : number;
	public get lastSelectedColorIndex() : number {
		return this._lastSelectedColorIndex;
	}

	// todo add props for caching select containers

	private _fileName : string;
	public get fileName() : string {
		return this._fileName;
	}

	public OnPreDataLoad(): void
	{
		this._tableContainer = document.getElementById("tableContainer") as HTMLElement;
		this._svgContainer = document.getElementById("svgContainer") as any as SVGElement;
		this.tableContainer.classList.add("noDisp");
		this.svgContainer.classList.add("noDisp");
		let fileLoadTutorialDiv = document.getElementById("fileLoadTutorial");
		fileLoadTutorialDiv.innerHTML = "";
		fileLoadTutorialDiv.classList.add("noDisp");
	}

	public OnDataLoaded(data: BoxPlotData, filename: string = ""): void
	{
		this._data = data;

		// this._vizWrapper = document.getElementById("vizWrapper") as HTMLElement;
		let bandRangeSlider = document.getElementById("bandRange");
		bandRangeSlider.oninput = (ev: Event) => { this.OnBandRangeChange(ev) };

		let thresholdSlider = document.getElementById("outlierLineThreshold");
		thresholdSlider.oninput = (ev: Event) => { this.OnOutlierThresholdChange(ev) };

		this._fileName = filename;

		this.addAxisScaleOptions("xAxisScale", this.data.scaleXType);
		let selectElement: HTMLSelectElement = document.getElementById("xAxisScale") as HTMLSelectElement;
		selectElement.addEventListener("change", (ev: Event) => { this.OnXAxisChange(ev)})

		this.addAxisScaleOptions("yAxisScale", this.data.scaleYType);
		selectElement = document.getElementById("yAxisScale") as HTMLSelectElement;
		selectElement.addEventListener("change", (ev: Event) => { this.OnYAxisChange(ev)})

		let xConstantSlider = document.getElementById("xSymLogConstant");
		xConstantSlider.oninput = (ev: Event) => { this.OnXSymConstantChange(ev); }

		let yConstantSlider = document.getElementById("ySymLogConstant");
		yConstantSlider.oninput = (ev: Event) => { this.OnYSymConstantChange(ev); }

		this.addOutlierMethodOptions(this.data.outlierMethod);
		selectElement = document.getElementById("outlierMethod") as HTMLSelectElement;
		selectElement.addEventListener("change", (ev: Event) => { this.OnOutlierMethodChange(ev)})


		this.revealSubToolsIfNeeded();

		let hiddenButtons = document.getElementsByClassName("toolContainer");
		for (let i = 0; i < hiddenButtons.length; i++)
		{
			hiddenButtons[i].classList.remove("noDisp");
		}
		// let fileLoadTutorialDiv = document.getElementById("fileLoadTutorial");
		// fileLoadTutorialDiv.innerHTML = "";
		// fileLoadTutorialDiv.classList.add("noDisp");
		this.tableContainer.classList.remove("noDisp");
		this.svgContainer.classList.remove("noDisp");
		// this.vizWrapper.classList.remove("noDisp");
		this.BuildDomTable();
		this.BuildDomGraph();
	}

	private addAxisScaleOptions(elementId: string, selectedOption: ScaleType): void
	{
		let selectElement: HTMLSelectElement = document.getElementById(elementId) as HTMLSelectElement;
		selectElement.innerHTML = "";
		let optionElement: HTMLOptionElement;
		for (let type of Object.keys(ScaleType))
		{
			optionElement = document.createElement("option")
			optionElement.value = type;
			optionElement.innerText = type;
			if (selectedOption == type)
			{
				optionElement.setAttribute("selected", "");
			}
			selectElement.appendChild(optionElement);
		}
	}

	private OnXAxisChange(ev: Event): void
	{
		let selectElement: HTMLSelectElement = ev.target as HTMLSelectElement;
		let value: string = selectElement.value;
		this.data.scaleXType = value as ScaleType;
		this.revealSubToolsIfNeeded();
		this.BuildDomGraph();
	}

	private OnYAxisChange(ev: Event): void
	{
		let selectElement: HTMLSelectElement = ev.target as HTMLSelectElement;
		let value: string = selectElement.value;
		this.data.scaleYType = value as ScaleType;
		this.revealSubToolsIfNeeded();
		this.BuildDomGraph();
	}

	private addOutlierMethodOptions(selectedOption: OutlierMethod): void
	{
		// todo combine with other enum generation method
		let selectElement: HTMLSelectElement = document.getElementById("outlierMethod") as HTMLSelectElement;
		selectElement.innerHTML = "";
		let optionElement: HTMLOptionElement;
		for (let type of Object.keys(OutlierMethod))
		{
			optionElement = document.createElement("option")
			optionElement.value = type;
			optionElement.innerText = type;
			if (selectedOption == type)
			{
				optionElement.setAttribute("selected", "");
			}
			selectElement.appendChild(optionElement);
		}
	}

	private OnOutlierMethodChange(ev: Event): void
	{
		let selectElement: HTMLSelectElement = ev.target as HTMLSelectElement;
		let value: string = selectElement.value;
		this.data.outlierMethod = value as OutlierMethod;
		this.data.updateOutliers();
		this.onBoxplotStatChange();
	}

	private revealSubToolsIfNeeded(): void
	{
		let xSliderContainer: HTMLElement = document.getElementById("xSymLogSliderContainer")
		if (this.data.scaleXType === ScaleType.SYMLOG)
		{
			xSliderContainer.classList.remove("noDisp");
		}
		else
		{
			xSliderContainer.classList.add("noDisp");
		}

		let ySliderContainer: HTMLElement = document.getElementById("ySymLogSliderContainer")
		if (this.data.scaleYType === ScaleType.SYMLOG)
		{
			ySliderContainer.classList.remove("noDisp");
		}
		else
		{
			ySliderContainer.classList.add("noDisp");
		}
	}

	private OnXSymConstantChange(ev: Event): void
	{
		let sliderElement: HTMLInputElement = ev.target as HTMLInputElement;
		let value: number = +sliderElement.value;
		// value is actually between 0 and 50
		//   we want to map it to 1e-50 -> 1
		value = Math.pow(10, -value);
		this.xSymConstantValueDisplay.innerText = value.toExponential(0);
		this.data.xSymLogConstant = value;
		this.BuildDomGraph();
	}


	private OnYSymConstantChange(ev: Event): void
	{
		let sliderElement: HTMLInputElement = ev.target as HTMLInputElement;
		let value: number = +sliderElement.value;
		// value is actually between 0 and 50
		//   we want to map it to 1e-50 -> 1
		value = Math.pow(10, -value);
		this.ySymConstantValueDisplay.innerText = value.toExponential(0);
		this.data.ySymLogConstant = value;
		this.BuildDomGraph();
	}

	public BuildDomGraph(): void
	{
		if (this.data === null || this.data === undefined)
		{
			return;
		}
		this.svgContainer.innerHTML = null;

		let rect: DOMRect | ClientRect = this.svgContainer.getBoundingClientRect();
		this._graphWidth = rect.width - this.margin.left - this.margin.right;
		this._graphHeight = rect.height - this.margin.top - this.margin.bottom;

		this.updateAxisScale();

		let svgSelect = d3.select("#svgContainer");

		let graphContainer: SvgSelection = svgSelect.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.buildDomAxis(graphContainer);

		this.buildDomGraphTitle(graphContainer); 

		let line: d3.Line<number> = this.getLine();

    	let rawFunctionLineGrouper: SvgSelection = graphContainer.append("g")
    		.attr("id", "rawFunctionLineGrouper");
    	this._rawFunctionLineGrouper = rawFunctionLineGrouper;

    	this.buildDomAllFunctionLines(rawFunctionLineGrouper, line);

    	let boxPlotLineGrouper: SvgSelection = graphContainer.append("g")
    		.attr("id", "boxPlotLineGrouper");
    	this._boxPlotLineGrouper = boxPlotLineGrouper;
    
    	this.buildDomBoxPlot(boxPlotLineGrouper, line);

    	let selectedFunctionsLineGrouper: SvgSelection = graphContainer.append("g")
    		.attr("id", "selectedFunctionsLineGrouper");
    	this._selectedFunctionsLineGrouper = selectedFunctionsLineGrouper;

    	this.buildDomSelectedFunctions();
    	
	}


	private updateAxisScale(): void
	{
		this._xScale = BoxPlotViz.getAxisScale(this.data.xMinMax, [0, this.graphWidth], this.data.scaleXType, this.data.xSymLogConstant);
		this._yScale = BoxPlotViz.getAxisScale(this.data.yMinMax, [this.graphHeight, 0], this.data.scaleYType, this.data.ySymLogConstant);
	}

	private static getAxisScale(domain: number[], range: number[], scaleType: ScaleType, symLogConstant: number): d3.ScaleContinuousNumeric<number, number>
	{
			switch (scaleType) {
			case ScaleType.LINEAR:
				return d3.scaleLinear()
					.domain(domain)
					.range(range);
				break;
			case ScaleType.LOG:
				return d3.scaleLog()
					.domain(domain)
					.range(range);
				break;
			case ScaleType.SYMLOG:
				return (d3 as any).scaleSymlog() // scaleSymlog type not defined.... (https://npm.taobao.org/package/@types/d3-scale/v/2.1.1)
					.domain(domain)
					.constant(symLogConstant)
					.range(range);
				break;
			default:
				throw "Error: scale type is not defined";
				break;
		}
	}

	private buildDomAxis(containerSelection: SvgSelection): void
	{
		containerSelection.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + this.graphHeight + ")")
		    .call(d3.axisBottom(this.xScale));

		containerSelection.append("g")
		    .attr("class", "y axis")
		    .call(d3.axisLeft(this.yScale));
	}

	private buildDomGraphTitle(containerSelection: SvgSelection): void
	{
		containerSelection.append("text")
			.attr("x", (this.graphWidth / 2))             
			.attr("y", this.margin.top)
			.attr("text-anchor", "middle")
			.attr("class", "graphTitle")
			.text(this.fileName);
	}

	private getLine(): d3.Line<number>
	{
		return d3.line<number>()
			.x((d, i) => { return this.xScale(this.data.functionDataSet.xValues[i]); })
			.y((d) => { return this.yScale(d) });
	}

	private buildDomAllFunctionLines(containerSelection: SvgSelection, line: d3.Line<number>): void
	{

    	let dataset: number[];
    	for (let i = 0; i < this.data.functionDataSet.length; ++i)
    	{
    		let functionData: FunctionData = this.data.functionDataSet.functionDataArray[i];
    		if (!functionData.isOutlier) 
    		{
    			continue; // todo hide 
    		}
    		dataset = functionData.yValues;

    		const className = functionData.isOutlier ? "outlierLine" : "dataLine";
			containerSelection.append("path")
				.datum(dataset)
			    .attr("class", className)
			    .attr("d", line)
  		}
  	}

  	private rebuildDomAllFunctionLines(): void
  	{
  		this.rawFunctionLineGrouper.html("");
  		let line: d3.Line<number> = this.getLine();
  		this.buildDomAllFunctionLines(this.rawFunctionLineGrouper, line);
  	}

  	private buildDomBoxPlot(containerSelection: SvgSelection, line: d3.Line<number>): void
  	{
		this.buildDomCentralBand(containerSelection);

    	this.buildDomOutlierBand(containerSelection, line);

    	this.buildDomMedian(containerSelection, line);
  	}

  	private rebuildDomBoxPlot(): void
  	{
  		this.boxPlotLineGrouper.html("");
  		let line: d3.Line<number> = this.getLine();
  		this.buildDomBoxPlot(this.boxPlotLineGrouper, line);
  	}

	private buildDomCentralBand(containerSelection: SvgSelection): void
	{
  		// central band
		let area = d3.area()
			.x((d, i) => { return this.xScale(this.data.functionDataSet.xValues[i]) }) 
			.y0((d) => { return this.yScale(d[0]) })
			.y1((d) => { return this.yScale(d[1]) });
	
		//Area in between
		var drawarea = containerSelection.append("path")
			.datum(this.data.band)
			.attr("class", "bandArea")
			.attr("d", area); 
  	}
	private buildDomOutlierBand(containerSelection: SvgSelection, line: d3.Line<number>): void
	{

 		// outlier band
 		let dataset: number[];
  		for (let i = 0; i < 2; i++)
  		{

    		dataset = this.data.outlierBand[i];

    		const className = "boundaryLine";
			containerSelection.append("path")
				.datum(dataset)
			    .attr("class", className)
			    .attr("d", line)
  		}
  	}
	private buildDomMedian(containerSelection: SvgSelection, line: d3.Line<number>): void
	{
		// median
		containerSelection.append("path")
			.datum(this.data.median)
			.attr("class", "medianLine")
			.attr("d", line); 
  	}

  	private buildDomSelectedFunctions(skipTable: boolean = false): void
  	{
  		this.selectedFunctionsLineGrouper.html("");
  		if (!skipTable)
  		{
  			this.tableSelectedContainer.innerHTML = "";
  		}

  		// hovered functions
  		let hoveredFunctionData: number[] | undefined = this.data.getHoveredFunctionData();
  		let line = this.getLine();
  		if (hoveredFunctionData !== undefined)
  		{		
			this.selectedFunctionsLineGrouper.append("path")
				.datum(hoveredFunctionData)
				.attr("class", "hoveredLine")
				.attr("d", line); 
  		}

  		// selected functions
  		let funcData: FunctionData;
  		let dataset: number[];
  		let selectedFunctionIndex: number;
  		let lineHexColor: string;
  		const numSelectedFunctions = this.data.functionDataSet.selectedFunctionIndices.length;
  		for (let i = 0; i < numSelectedFunctions; i++)
  		{
  			let selectedFunctionIndex: number = this.data.functionDataSet.selectedFunctionIndices[i];
  			funcData = this.data.functionDataSet.functionDataArray[selectedFunctionIndex];
  			if (!skipTable)
  			{
  				this.buildDomTableRow(this.tableSelectedContainer, funcData, true);
  			}
    		dataset = funcData.yValues;
    		lineHexColor = funcData.selectedHexColor;
    		const className = "selectedLine";
			this.selectedFunctionsLineGrouper.append("path")
				.datum(dataset)
			    .attr("class", className)
			    .attr("d", line)
			    .attr("style", "stroke:" + lineHexColor + ";")
  		}

  		// selected table elements

  	}

  	private getNextColor(): string
  	{
  		this._lastSelectedColorIndex++;
  		const i = this._lastSelectedColorIndex % this.selectedColorOptions.length;
  		return this.selectedColorOptions[i];
  	}

  	private static lightenColor(color: string): string
  	{
  			let backColorObj: d3.HSLColor = d3.hsl(color);
  			backColorObj.s /= 2; // half the saturation
  			backColorObj.l = Math.max(backColorObj.l + 0.25, 0.9);
  			return backColorObj.hex();
  	}

  	public BuildDomTable(): void
  	{
  		this.tableContainer.innerHTML = "";
  		let cellProps: CellProperties[] = [
  		{
  			cellText: "Name", extraClass: "nameHeaderCell"
  		},
  		{
  			cellText: "Depth", extraClass: "depthHeaderCell"
  		},
  		{
  			cellText: "Rank", extraClass: "rankHeaderCell"
  		}];
  		this.buildDomTableRowFromProps(this.tableContainer, cellProps, true);

  		let selectedContainer: HTMLElement = document.createElement("div");
  		selectedContainer.id = "tableSelectedContainer";
  		selectedContainer.classList.add("tableSelectedContainer");
  		this._tableSelectedContainer = selectedContainer;
  		this.tableContainer.appendChild(selectedContainer);

  		let valueContainer: HTMLElement = document.createElement("div");
  		valueContainer.classList.add("tableValuesContainer");
  		this._tableValueContainer = valueContainer;
  		for (let functionData of this.data.functionDataSet.functionDataArray)
  		{
  			this.buildDomTableRow(valueContainer, functionData);
  		}
  		this.tableContainer.appendChild(valueContainer);
  	}

  	private buildDomTableRow(container: HTMLElement, functionData: FunctionData, addColor: boolean = false): void
  	{
  		let cellProps: CellProperties[] = [
  		{
  			cellText: functionData.name, extraClass: "nameCell"
  		},
  		{
  			cellText: functionData.depth.toFixed(3), extraClass: "depthCell"
  		},
  		{
  			cellText: (functionData.index+1).toString(), extraClass: "indexCell"
  		}];
  		let borderColor: string;
  		let backColor: string;
  		if (addColor)
  		{
  			borderColor = functionData.selectedHexColor;
  			backColor = BoxPlotViz.lightenColor(borderColor);
  		}
  		this.buildDomTableRowFromProps(container, cellProps, false, functionData.index, borderColor, backColor);

  	}

  	// todo - wrap two colors into one obj
  	private buildDomTableRowFromProps(container: HTMLElement, cells: CellProperties[], isHeader: boolean = false, index?: number, borderColor?: string, backColor?: string): void
  	{
		let tableRow: HTMLElement = document.createElement("div");
		const className: string = isHeader ? "tableRowHeader" : "tableRowContainer";
		tableRow.classList.add(className);
		if (index !== undefined && index !== null)
		{
			tableRow.setAttribute("data-index", index.toString());
			tableRow.addEventListener("mouseenter", (ev: Event) => { this.onMouseEnterTableRow(ev); })
			tableRow.addEventListener("mouseleave", (ev: Event) => { this.onMouseLeaveTableRow(ev); })

			tableRow.addEventListener("click", (ev: Event) => { this.onClickTableRow(ev); })
		}
		let newCellElement: HTMLElement = document.createElement("div");
		newCellElement.classList.add("tableCell", "iconContainer");
		let icon: HTMLElement = document.createElement("i");
		icon.classList.add("fas", "fa-thumbtack");
		newCellElement.appendChild(icon);
		tableRow.appendChild(newCellElement);

		for (let cell of cells)
		{
	  		this.buildDomTableCell(tableRow, cell.cellText, cell.extraClass);
		}
		if (borderColor !== undefined && backColor !== undefined)
		{
  			tableRow.setAttribute("style", "border-color:" + borderColor + "; background-color:" + backColor + ";");
		}
  		container.appendChild(tableRow);
  	}

  	private buildDomTableCell(container: HTMLElement, innerText: string, extraClass: string): void
  	{
  		let newCellElement: HTMLElement = document.createElement("div");
  		newCellElement.innerText = innerText;
  		newCellElement.title = innerText;
  		newCellElement.classList.add("tableCell", extraClass);
  		container.appendChild(newCellElement);
  	}

  	private onMouseEnterTableRow(ev: Event): void
  	{
  		let target: HTMLElement = ev.target as HTMLElement;
  		target.classList.add("rowHovered");

  		let value: number = +target.getAttribute("data-index");
  		this.data.functionDataSet.hoveredFunctionIndex = value;
  		this.buildDomSelectedFunctions(true);
  	}

  	private onMouseLeaveTableRow(ev: Event): void
  	{
  		let target: HTMLElement = ev.target as HTMLElement;
  		target.classList.remove("rowHovered");
  		
  		this.data.functionDataSet.hoveredFunctionIndex = -1;
  		this.buildDomSelectedFunctions(true);
  	}

  	private onClickTableRow(ev: Event): void
  	{
  		let rowDiv: HTMLElement = ev.currentTarget as HTMLElement;
  		
  		let value: number = +rowDiv.getAttribute("data-index");
  		let indexAdded: boolean = this.data.functionDataSet.toggleSelectIndex(value);
  		if (indexAdded)
  		{
  			rowDiv.classList.add("rowSelected");
  			this._lastSelectedColorIndex++;
  			const color: string = this.getNextColor();
  			this.data.functionDataSet.functionDataArray[value].selectedHexColor = color;
  			const backColor: string = BoxPlotViz.lightenColor(color);
  			rowDiv.setAttribute("style", "border-color:" + color + "; background-color:" + backColor + ";");
  		}
  		else
  		{
  			let element: Element = this.tableValueContainer.querySelectorAll("[data-index='" + value.toString() + "']")[0];
  			element.classList.remove("rowSelected");
  			element.setAttribute("style", "");
  		}
  		this.buildDomSelectedFunctions();
  	}

	public OnBandRangeChange(event: Event): void
	{
		let newRange: number = +(event.target as HTMLInputElement).value;
		this.bandWidthValueDisplay.innerText = newRange.toFixed(0) + "%";
		newRange /= 100.0;
		this.data.bandWidth = newRange;
		this.data.updateFunctionBands();
		this.data.updateOutliers();
		this.onBoxplotStatChange();
	}

	public OnOutlierThresholdChange(event: Event): void
	{
		let newThreshold: number = +(event.target as HTMLInputElement).value;
		this.outlierThresholdValueDisplay.innerText = newThreshold.toFixed(1);
		this.data.outlierThreshold = newThreshold;
		this.data.updateOutliers();
		this.onBoxplotStatChange();
	}

	private onBoxplotStatChange(): void
	{
		this.rebuildDomAllFunctionLines();
		this.rebuildDomBoxPlot();
	}

}
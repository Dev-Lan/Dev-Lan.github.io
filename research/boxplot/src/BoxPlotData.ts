import { FunctionDataSet } from './FunctionDataSet';
import { FunctionData } from './FunctionData';

type FuncOnBoxPlotData = (data: BoxPlotData, filename?: string) => void;

export enum ScaleType {
	LINEAR = "LINEAR",
	LOG = "LOG",
	SYMLOG = "SYMLOG"
};

export class BoxPlotData {
	
	constructor(onDataLoadedCallback: FuncOnBoxPlotData) {
		// this._funcLookup = new Map<string, FunctionMetaData>();
		this._onDataLoadedCallback = onDataLoadedCallback;
		this.bandWidth = 0.5;
		this.outlierThreshold = 1.5;
		this._scaleXType = ScaleType.LINEAR;
		this._scaleYType = ScaleType.LINEAR;
		this._xSymLogConstant = 1e-10;
		this._ySymLogConstant = 1e-10;
	}

	private init(): void
	{
		this._dataColKeys = [];
		this._xMinMax = [];
		this._yMinMax = [];
		this._functionDataSet = new FunctionDataSet();
		this._depthPreProcessed = false;
	}


	public timeStepKeyword = "t";

	private _onDataLoadedCallback : FuncOnBoxPlotData;
	public get onDataLoadedCallback() : FuncOnBoxPlotData {
		return this._onDataLoadedCallback;
	}

	private _dataColKeys : string[];
	public get dataColKeys() : string[] {
		return this._dataColKeys;
	}

	private _xMinMax : number[];
	public get xMinMax() : number[] {
		return this._xMinMax;
	}

	private _yMinMax : number[];
	public get yMinMax() : number[] {
		return this._yMinMax;
	}

	private _xSymLogConstant : number;
	public get xSymLogConstant() : number {
		return this._xSymLogConstant;
	}
	public set xSymLogConstant(v: number) {
		this._xSymLogConstant = v;
	}

	private _ySymLogConstant : number;
	public get ySymLogConstant() : number {
		return this._ySymLogConstant;
	}
	public set ySymLogConstant(v: number) {
		this._ySymLogConstant = v;
	}


	private _functionDataSet : FunctionDataSet;
	public get functionDataSet() : FunctionDataSet {
		return this._functionDataSet;
	}
	public set functionDataSet(v : FunctionDataSet) {
		this._functionDataSet = v;
	}

	// private _lowerBand : number[];
	// public get lowerBand() : number[] {
	// 	return this._lowerBand;
	// }

	// private _upperBand : number[];
	// public get upperBand() : number[] {
	// 	return this._upperBand;
	// }

	private _bandWidth : number;
	public get bandWidth() : number {
		return this._bandWidth;
	}
	public set bandWidth(v: number) {
		this._bandWidth = v;
	}

	private _outlierThreshold : number;
	public get outlierThreshold() : number {
		return this._outlierThreshold;
	}
	public set outlierThreshold(v: number) {
		this._outlierThreshold = v;
	}

	private _scaleXType : ScaleType;
	public get scaleXType() : ScaleType {
		return this._scaleXType;
	}
	public set scaleXType(v: ScaleType) {
		this._scaleXType = v;
	}

	private _scaleYType : ScaleType;
	public get scaleYType() : ScaleType {
		return this._scaleYType;
	}
	public set scaleYType(v: ScaleType) {
		this._scaleYType = v;
	}

	private _band : [number, number][];
	public get band() : [number, number][] {
		return this._band;
	}

	private _outlierBand : [number[], number[]];
	public get outlierBand() : [number[], number[]] {
		return this._outlierBand;
	}

	private _median : number[];
	public get median() : number[] {
		return this._median;
	}

	private _depthPreProcessed : boolean;
	public get depthPreProcessed() : boolean {
		return this._depthPreProcessed;
	}

	public Initialize(rawValues: d3.DSVRowArray<string>, filename: string): void
	{
		this.init();
		// this._rowArray = rawValues;
		for (var i = rawValues.columns.length - 1; i >= 0; i--) {
			const col: string = rawValues.columns[i]
			if (this.timeStepKeyword.includes(col.toLowerCase()))
			{
				continue;
			}
			this.dataColKeys.push(col);
			this.functionDataSet.addFunction(col);
			// const funcMetaData: FunctionMetaData = { columnIndex: i, depth: 0 };
			// this.funcLookup.set(col, funcMetaData);
		}
		let rowIdx = 0;
		for (const row of rawValues)
		{
			rowIdx++;
			console.log("row: " + rowIdx + " / " + rawValues.length);
			this.processRow(row);
		}
		this.functionDataSet.checkDataLengths();
		if (!this.depthPreProcessed)
		{
			this.functionDataSet.normalizeDepths();
		}
		this.functionDataSet.sortFunctionsByDepth();
		this.updateFunctionBands();
		this.findMedian();
		this.updateOutliers();
		console.log(this.functionDataSet);
		this.onDataLoadedCallback(this, filename);
	}

	private processRow(row: d3.DSVRowString<string>): void
	{
		let timeStepValueString: string = row[this.timeStepKeyword]
		if (timeStepValueString.toLowerCase() === "depth")
		{
			// add depths, set some boolean
			for (const colKey of this.dataColKeys)
			{
				let value: number = +row[colKey];
				let functionData: FunctionData = this.functionDataSet.funcLookup.get(colKey);
				functionData.depth = value;
			}
			this._depthPreProcessed = true;
			return;
		}
		let timeStepValue: number = +timeStepValueString;
		this.functionDataSet.addXValue(timeStepValue);

		BoxPlotData.updateMinMax(timeStepValue, this.xMinMax)
		for (const colKey of this.dataColKeys)
		{
			let value: number = +row[colKey];
			this.functionDataSet.addYValue(colKey, value);
			BoxPlotData.updateMinMax(value, this.yMinMax);
			if (!this.depthPreProcessed)
			{
				const depthFromThisRow: number = this.processValue(value, row);
				let functionData: FunctionData = this.functionDataSet.funcLookup.get(colKey);
				functionData.depth += depthFromThisRow;
			}
		}
	}

	private processValue(value: number, row: d3.DSVRowString<string>): number
	{
		let depthCount = 0;
		for (let i = 0; i < this.dataColKeys.length - 1; i++)
		{
			let b1: number = +row[this.dataColKeys[i]];
			for (let j = i + 1; j < this.dataColKeys.length; j++)
			{
				let b2: number = +row[this.dataColKeys[j]];
				if (Math.min(b1, b2) <= value && value <= Math.max(b1, b2))
				{
					depthCount += 1;
				}
			}
		}
		return depthCount;
	}

	private static updateMinMax(value: number, minMax: number[]): void
	{
		if (minMax.length === 0)
		{
			minMax.push(value, value);
		}
		else
		{
			minMax[0] = Math.min(minMax[0], value);
			minMax[1] = Math.max(minMax[1], value);
		}
	}

	public updateFunctionBands(): void
	{
		this.functionDataSet.checkIfSorted();
		const lastFunctionIndex: number = Math.ceil(this.bandWidth * this.functionDataSet.length);
		this._band = [];
		for (let i = 0 ; i < this.functionDataSet.xValues.length; i++)
		{
			let minValue: number = Infinity;
			let maxValue: number = -Infinity;
			for (let j = 0; j < lastFunctionIndex; j++)
			{
				let thisValue: number = this.functionDataSet.functionDataArray[j].yValues[i];
				minValue = Math.min(minValue, thisValue);
				maxValue = Math.max(maxValue, thisValue);
			}
			this.band.push([minValue, maxValue]);
		}
	}

	public updateOutliers(): void
	{
		this.functionDataSet.checkIfSorted();
		this.functionDataSet.resetOutliersToFalse();
		const maxDepth: number = this.functionDataSet.getFuncDepth(0);
		const lastFunctionIndex: number = Math.ceil(this.bandWidth * (this.functionDataSet.length - 1));
		const boundaryDepth: number = this.functionDataSet.getFuncDepth(lastFunctionIndex);
		const envelopeWidth: number = maxDepth - boundaryDepth;
		const outlierBoundary: number = envelopeWidth * this.outlierThreshold;

		this.functionDataSet.setOutliers(maxDepth - outlierBoundary);

		this._outlierBand = [[], []];
		for (let i = 0 ; i < this.functionDataSet.xValues.length; i++)
		{
			let minValue: number = Infinity;
			let maxValue: number = -Infinity;
			for (let functionData of this.functionDataSet.functionDataArray)
			{
				if (!functionData.isOutlier)
				{
					let thisValue: number = functionData.yValues[i];
					minValue = Math.min(minValue, thisValue);
					maxValue = Math.max(maxValue, thisValue);
				}
			}
			this.outlierBand[0].push(minValue);
			this.outlierBand[1].push(maxValue);
			//todo there can be NaN infinity
		}
	}

	private findMedian(): void
	{
		this.functionDataSet.checkIfSorted();
		this._median = [];
		let index: number = 0;
		let depth: number = this.functionDataSet.getFuncDepth(index);
		while (this.functionDataSet.getFuncDepth(index + 1) === depth) // todo
		{
			index++;
		}

		this._median = this.functionDataSet.averageFunctionsToIndex(index);

	}

	public getHoveredFunctionData(): number[] | undefined 
	{
		const index = this.functionDataSet.hoveredFunctionIndex;
		if (index < 0) {
			return undefined;
		}
		return this.functionDataSet.functionDataArray[index].yValues;
	}


}
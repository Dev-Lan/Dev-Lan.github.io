import { FunctionDataSet } from './FunctionDataSet';
import { FunctionData } from './FunctionData';
import { DevlibMath } from '../../lib/DevlibMath';
import { DevlibTSUtil } from '../../lib/DevlibTSUtil';
import { ProgressBar } from '../../widgets/ProgressBar';
import { CurveListFactory } from '../../DataModel/CurveListFactory';
import { CurveND } from '../../DataModel/CurveND';

import * as d3 from 'd3';

type FuncOnBoxPlotData = (data: BoxPlotData, filename?: string) => void;

export enum ScaleType {
	LINEAR = "LINEAR",
	LOG = "LOG",
	SYMLOG = "SYMLOG"
};


export class BoxPlotData {
	
	constructor(onPreDataLoadCallback: Function, onDataLoadedCallback: FuncOnBoxPlotData) {
		this._onPreDataLoad = onPreDataLoadCallback;
		this._onDataLoadedCallback = onDataLoadedCallback;
		this.bandWidth = 0.5;
		this.outlierThreshold = 1.5;
		this._scaleXType = ScaleType.LINEAR;
		this._scaleYType = ScaleType.LINEAR;
		this._xSymLogConstant = 1e-10;
		this._ySymLogConstant = 1e-10;

		// todo - don't reference dom from data
		const progressContainer: HTMLElement = document.getElementById("progressBarContainer");
		this._progressBar = new ProgressBar(progressContainer);
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

	private _onPreDataLoad : Function;
	public get onPreDataLoad() : Function {
		return this._onPreDataLoad;
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

	// todo - delete this if we don't need it.
	private _rawValues : d3.DSVRowArray<string>;
	public get rawValues() : d3.DSVRowArray<string> {
		return this._rawValues;
	}

	private _progressBar : ProgressBar;
	public get progressBar() : ProgressBar {
		return this._progressBar;
	}

	public async Initialize(rawValues: string, filename: string): Promise<void>
	{
		this.onPreDataLoad();
		this.init();
		// const rawValueArray = 
		// const curveList: CurveND[] = CurveListFactory.CreateCurveListFromCSV(rawValues);
		
		let rawValueArray: d3.DSVRowArray<string> = d3.csvParse(rawValues);
		this._rawValues = rawValueArray;
		for (var i = rawValueArray.columns.length - 1; i >= 0; i--) {
			const col: string = rawValueArray.columns[i]
			if (this.timeStepKeyword.includes(col.toLowerCase()))
			{
				continue;
			}
			this.dataColKeys.push(col);
			this.functionDataSet.addFunction(col);
		}
		if (false) // todo - this can estimate things faster, off for now.
		{
			await this.estimateBandDepths();
			this._depthPreProcessed = true;
		}
		// else
		// {		
		let rowIdx = 0;
		for (const row of rawValueArray)
		{
			rowIdx++;
			await this.progressBar.updateProgress(rowIdx / rawValueArray.length);
			this.processRow(row);
		}
		// }
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
		await this.progressBar.done(); // todo - maybe don't need this await
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
		const rowValues: Map<string, number> = this.convertToNumberDict(row);
		BoxPlotData.updateMinMax(timeStepValue, this.xMinMax)
		this.calculateDepthsForRow(rowValues);
	}

	private convertToNumberDict(row: d3.DSVRowString<string>): Map<string, number>
	{
		const numDict: Map<string, number> = new Map<string, number>();
		for (const colKey of this.dataColKeys)
		{
			numDict.set(colKey, +row[colKey]);
		}
		return numDict
	}

	private calculateDepthsForRow(rowValues: Map<string, number>): void
	{
		for (const colKey of rowValues.keys())
		{
			let value: number = rowValues.get(colKey);
			this.functionDataSet.addYValue(colKey, value);
			BoxPlotData.updateMinMax(value, this.yMinMax);
			if (!this.depthPreProcessed)
			{
				const depthFromThisRow: number = this.processValue(value, rowValues);
				let functionData: FunctionData = this.functionDataSet.funcLookup.get(colKey);
				functionData.depth += depthFromThisRow;
			}
		}
	}


	private processValue(value: number, rowValues: Map<string, number>): number
	{
		let depthCount = 0;
		for (let i = 0; i < this.dataColKeys.length - 1; i++)
		{
			let b1: number = rowValues.get(this.dataColKeys[i]);
			for (let j = i + 1; j < this.dataColKeys.length; j++)
			{
				let b2: number = rowValues.get(this.dataColKeys[j]);
				if (BoxPlotData.valueInBandPoints(value, b1, b2))
				{
					depthCount++;
				}
			}
		}
		return depthCount;
	}

	private superBootstrapStats(): void
	{
		const numBandOptions: number[] = [25, 50, 100, 200, 400, 800];
		const sampleSize = 100;
		for (let numBands of numBandOptions)
		{
			console.log(numBands);
			let depthStats = this.bootstrapStats(sampleSize, numBands);
			console.log(depthStats[0]);
		}
	}

	private bootstrapStats(numSamples: number, numBands: number): any
	{
		// const numSamples = 10;
		// const numBands = 50;
		let depths: Map<string, number[]> = new Map<string, number[]>();

		type stats = {
			avg: number,
			variance: number,
			mse: number,
			bestDepth: number,
			diff: number,
			id: string
		};
		// let depthStats: Map<string, stats> = new Map<string, stats>();
		// any {avg: number, variance: number}
		for (let key of this.dataColKeys)
		{
			let zeroArr = Array(numSamples).fill(0);
			depths.set(key, zeroArr);
		}
		for (let i = 0; i < numSamples; i++)
		{
			const printInterval = 100;
			if ( i % printInterval === 0)
			{
				console.log("[ ", (i + printInterval), ", ", numSamples, "]");
			}
			const bands = this.getNBandIndices(numBands, this.dataColKeys.length - 1);
			for (const row of this.rawValues)
			{
				let rowDict = this.convertToNumberDict(row);

				for (const key of rowDict.keys())
				{
					const value: number = rowDict.get(key);
					let d = this.processValueForBandsInRow(value, rowDict, bands);
					depths.get(key)[i] += d;
				}
			}
		}
		const maxDepthCount = numBands * this.rawValues.length;
		let depthStatsArray = [];
		for (let [key, depthArr] of depths)
		{
			for (var i = 0; i < depthArr.length; i++)
			{
				depthArr[i] = depthArr[i] / maxDepthCount * 100; // normalize and express in percentages
			}
			let average: number = DevlibMath.average(depthArr);
			let variance: number = DevlibMath.variance(depthArr);
			let bestDepthGuess = 100 * this.functionDataSet.funcLookup.get(key).depth;
			let mse: number = DevlibMath.meanSquaredError(depthArr, bestDepthGuess);
			let s: stats = {
				avg: average,
				variance: variance,
				mse: mse,
				bestDepth: bestDepthGuess,
				diff: average - bestDepthGuess,
				id: key
			};
			// depthStats.set(key, s);
			depthStatsArray.push(s);
		}

		console.table(depthStatsArray);
		return depthStatsArray;
	}

	private async estimateBandDepths(numSamples: number = 5000): Promise<void>
	{
		let depths: Map<string, number> = new Map<string, number>();
		for (const key of this.dataColKeys)
		{
			depths.set(key, 0);
		}
		// const timeIntervalUpdate = 200;
		let lastUpdateTime: number = performance.now();

		// const consoleUpdates = 20;
		// const interval: number = Math.round(numSamples / consoleUpdates);
		// const progElement = document.getElementById("progressBar");
		for (let i = 1; i <= numSamples; i++)
		{
			await this.progressBar.updateProgress(i / numSamples);

			const band = BoxPlotData.getRandomBand(this.dataColKeys.length - 1);
			for (const row of this.rawValues)
			{
				let rowDict = this.convertToNumberDict(row);

				for (const key of rowDict.keys())
				{
					const value: number = rowDict.get(key);
					if (this.valueInBand(value, rowDict, band))
					{
						let oldDepth: number = depths.get(key);
						depths.set(key, oldDepth + 1);
					}
				}
			}
		}
		for (const func of this.functionDataSet.functionDataArray)
		{
			func.depth = depths.get(func.name) / (numSamples * this.rawValues.length);
		}
	}

	private getNBandIndices(num: number, maxIndex: number): [number, number][]
	{
		let bandList: [number, number][] = [];
		// let bandSet = new Set<string>();

		while (bandList.length < num)
		{
			// let i1 = DevlibMath.randomInt(0, maxIndex);
			// let i2 = i1;
			// while (i2 === i1)
			// {
			// 	i2 = DevlibMath.randomInt(0, maxIndex);
			// }
			let band: [number, number] = BoxPlotData.getRandomBand(maxIndex);
			// let hashList = this.hashBand(band)
			// if (!bandSet.has(hashList[0]) && !bandSet.has(hashList[1]))
			// {
			// 	bandList.push(band);
			// 	bandSet.add(hashList[0]);
			// 	bandSet.add(hashList[1]);
			// }
			bandList.push(band);

		}
		return bandList;
	}

	private static getRandomBand(maxIndex: number): [number, number]
	{
		let i1 = DevlibMath.randomInt(0, maxIndex);
		let i2 = i1;
		while (i2 === i1)
		{
			i2 = DevlibMath.randomInt(0, maxIndex);
		}
		return [i1, i2];
	}

	private hashBand(band: [number, number])
	{
		let a: string = band[0] + "," + band[1];
		let b: string = band[1] + "," + band[0];
		return [a, b];
	}

	private processValueForBandsInRow(value: number, rowValues: Map<string, number>, bands: [number, number][]): number
	{
		let depthCount = 0;
		for (const b of bands)
		{
			if (this.valueInBand(value, rowValues, b))
			{
				depthCount++;
			}
		}
		return depthCount;
	} 
	
	private processValueForRandomBandsInRow(value: number, rowValues: Map<string, number>, bands: [number, number][]): number
	{
		let depthCount = 0;
		for (let i = 0; i < bands.length; ++i)
		{
			let randI = DevlibMath.randomInt(0, bands.length - 1);
			let b: [number, number] = bands[randI];
			if (this.valueInBand(value, rowValues, b))
			{
				depthCount++;
			}
		}
		return depthCount;
	} 

	private valueInBand(value: number, rowValues: Map<string, number>, band: [number, number]): boolean
	{
		const b1Index: number = band[0];
		const b2Index: number = band[1];
		const b1: number = rowValues.get(this.dataColKeys[b1Index]);
		const b2: number = rowValues.get(this.dataColKeys[b2Index]);
		return BoxPlotData.valueInBandPoints(value, b1, b2)
	} 


	private static valueInBandPoints(value: number, b1: number, b2: number)
	{
		return Math.min(b1, b2) <= value && value <= Math.max(b1, b2);
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
		this.updateOutliersByBandDepth();
	}

	public updateOutliersByBandDepth(): void
	{
		const maxDepth: number = this.functionDataSet.getFuncDepth(0);
		const lastFunctionIndex: number = Math.ceil(this.bandWidth * (this.functionDataSet.length - 1));
		const boundaryDepth: number = this.functionDataSet.getFuncDepth(lastFunctionIndex);
		const envelopeWidth: number = maxDepth - boundaryDepth;
		const outlierBoundary: number = envelopeWidth * this.outlierThreshold;

		this.functionDataSet.setOutliersByDepthThreshold(boundaryDepth - outlierBoundary);

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
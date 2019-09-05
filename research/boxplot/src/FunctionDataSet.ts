import { FunctionData } from './FunctionData';

export class FunctionDataSet {
	constructor()
	{
		this._xValues = [];
		this.functionDataArray = [];
		this.funcLookup = new Map<string, FunctionData>();
		this._hoveredFunctionIndex = -1;
		this._selectedFunctionIndices = [];
	}

	private _xValues : number[];
	public get xValues() : number[] {
		return this._xValues;
	}
	public set xValues(v : number[]) {
		this._xValues = v;
	}

	public get length() : number {
		return this.functionDataArray.length;
	}

	private _functionDataArray : FunctionData[];
	public get functionDataArray() : FunctionData[] {
		return this._functionDataArray;
	}
	public set functionDataArray(v : FunctionData[]) {
		this._functionDataArray = v;
	}

	private _hoveredFunctionIndex : number;
	public get hoveredFunctionIndex() : number {
		return this._hoveredFunctionIndex;
	}
	public set hoveredFunctionIndex(v: number) {
		this._hoveredFunctionIndex = v;
	}

	private _selectedFunctionIndices : number[];
	public get selectedFunctionIndices() : number[] {
		return this._selectedFunctionIndices;
	}
	public set selectedFunctionIndices(v : number[]) {
		this._selectedFunctionIndices = v;
	}

	private _funcLookup : Map<string, FunctionData>;
	public get funcLookup() : Map<string, FunctionData> {
		return this._funcLookup;
	}
	public set funcLookup(v : Map<string, FunctionData>) {
		this._funcLookup = v;
	}

	public addFunction(functionName: string): void
	{
		let newFunction: FunctionData = new FunctionData(functionName);
		this.functionDataArray.push(newFunction);
		if (this.funcLookup.has(functionName))
		{
			throw "Error: table header values must be unique.";
		}
		this.funcLookup.set(functionName, newFunction);
	}

	public addYValue(key: string, value: number): void
	{
		this.funcLookup.get(key).yValues.push(value);
	}

	public addXValue(value: number): void
	{
		this.xValues.push(value);
	}

	public getFuncDepth(index: number): number
	{
		return this.functionDataArray[index].depth;
	}

	public normalizeDepths(): void
	{
		let maxPossibleDepth: number = this.xValues.length * FunctionDataSet.nChooseTwo(this.length);
		for (let funcData of this.functionDataArray)
		{
			funcData.depth /= maxPossibleDepth;
		}
	}

	private static nChooseTwo(n: number): number
	{
		return n * (n-1) / 2.0
	}

	public sortFunctionsByDepth(): void
	{
		this.functionDataArray.sort((a: FunctionData, b: FunctionData): number =>
		{
			return b.depth - a.depth;
		});
		for (var i = 0; i < this.length; i++)
		{
			this.functionDataArray[i].index = i;
		}
	}

	public averageFunctionsToIndex(index: number): number[]
	{
		if (index === 0)
		{
			return this.functionDataArray[0].yValues;
		}
		let averagedFunction: number[] = [];
		for (let i = 0; i < this.length; i++)
		{		
			let averagedValue = 0;
			for (let j = 0; j <= index; j++)
			{
				averagedValue += this.functionDataArray[j].yValues[i];
			}
			averagedValue = averagedValue / (index + 1);
			averagedFunction.push(averagedValue);
		}
		return averagedFunction;
	}

	public setOutliersByDepthThreshold(thresholdDepth: number): void
	{
		for (let functionData of this.functionDataArray)
		{
			if (functionData.depth <= thresholdDepth)
			{
				functionData.isOutlier = true;
			}
		}
	}

	public setOutliersByOutlierBand(outlierBand: [number[], number[]]): void
	{
		for (let functionData of this.functionDataArray)
		{
			for (let i = 0; i < functionData.yValues.length; i++)
			{
				let v = functionData.yValues[i];
				let min = outlierBand[0][i];
				let max = outlierBand[1][i];
				if (v < min || v > max)
				{
					functionData.isOutlier = true;
					break; // no need to continue checking this function. It is an outlier.
				}
			}

		}
	}

	public checkDataLengths(): void
	{
		const numXValues = this.xValues.length;
		for (const functionData of this.functionDataArray)
		{
			if (functionData.yValues.length !== numXValues)
			{
				throw "Error: number of values per function is mismatched."
			}
		}
	}

	public checkIfSorted(): void
	{
		for (let i = 0; i < this.functionDataArray.length - 1; i++)
		{
			let next: number = i + 1;
			if (this.functionDataArray[i].depth < this.functionDataArray[next].depth)
			{
				throw "Error: functions are not sorted by depth";
			}
		}
	}

	public resetOutliersToFalse(): void
	{
		for (const functionData of this.functionDataArray)
		{
			functionData.isOutlier = false;
		}
	}

	public toggleSelectIndex(index: number): boolean
	{
		let selectedFuncIndexPosition = this.selectedFunctionIndices.findIndex((i: number) => {
			return i === index;
		});
		if (selectedFuncIndexPosition >= 0)
		{
			this.selectedFunctionIndices.splice(selectedFuncIndexPosition, 1);
			return false; // removed
		}
		else
		{
			this.selectedFunctionIndices.push(index);
			return true; // added
		}
	}

}
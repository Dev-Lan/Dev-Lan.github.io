import { Metric } from './Metric';
import { PointND } from './PointND';
import { DevlibMath } from '../lib/DevlibMath';
import { DevlibAlgo } from '../lib/DevlibAlgo';

export class CurveND {
	
	constructor(id: string) {
		this._id = id;
		this._valueMap = new Map<string, Metric>();
		this._pointArray = [];
	}

	private _id : string;
	public get id() : string {
		return this._id;
	}

	private _inputKey : string;
	public get inputKey() : string {
		return this._inputKey;
	}

	private _valueMap : Map<string, Metric>;
	public get valueMap() : Map<string, Metric> {
		return this._valueMap;
	}
	// public set valueMap(v : Map<string, Metric>) {
	// 	this._valueMap = v;
	// }

	private _pointArray : PointND[];
	public get pointArray() : PointND[] {
		return this._pointArray;
	}



	public set(key: string, value: number): void
	{
		const m = new Metric(value);
		this._valueMap.set(key, m);
	}

	public get(key: string): number
	{
		return this._valueMap.get(key).value;
	}

	// finds the value of the property with given key. Will interpolate.
	public getPointValue(inputValue: number, outputKey: string): number | undefined
	{
		let sortFunction = DevlibAlgo.compareProperty<PointND>(inputValue, (point: PointND) => 
		{
			return point.get(this.inputKey);
		});
		let pointIndex: number | [number, number];
		pointIndex = DevlibAlgo.BinarySearchIndex(this.pointArray, sortFunction);

		if (typeof pointIndex === "number")
		{
			return this.pointArray[pointIndex].get(outputKey);
		}
		const [idx1, idx2] = pointIndex;
		if (idx1 === undefined || idx2 === undefined)
		{
			// out of bounds
			return undefined;
		}
		const point1 = this.pointArray[idx1];
		const point2 = this.pointArray[idx2];

		const val1 = point1.get(outputKey);
		const val2 = point2.get(outputKey);

		const t1 = point1.get(this.inputKey);
		const t2 = point2.get(this.inputKey);

		const tDiff = t2 - t1;
		const portion = (inputValue - t1) / tDiff;
		const valDiff = val2 - val1;

		return val1 + valDiff * portion;
	}

	public getPointWeight(pointIndex: number): number
	{
		const idxLeft = Math.max(pointIndex - 1, 0);
		const idxRight = Math.min(pointIndex + 1, this.pointArray.length - 1);
		const tLeft = this.pointArray[idxLeft].get(this.inputKey);
		const tRight = this.pointArray[idxRight].get(this.inputKey);
		return (tRight - tLeft ) / 2;
	}

	public addPoint(point: PointND): void
	{
		this._pointArray.push(point);
	}

	public sort(key: string): void
	{
		let sortFunction = DevlibAlgo.sortOnProperty<PointND>((point: PointND) => 
		{
			return point.valueMap.get(key).value;
		});
		this.pointArray.sort(sortFunction);
		this._inputKey = key;
	}

	public getMinMax(key: string): [number, number]
	{
		let minN: number = Infinity;
		let maxN: number = -Infinity;

		for (let point of this.pointArray)
		{
			let val = point.valueMap.get(key).value;
			if (val < minN)
			{
				minN = val;
			}
			if (val > maxN)
			{
				maxN = val;
			}
		}

		return [minN, maxN]
	}

}
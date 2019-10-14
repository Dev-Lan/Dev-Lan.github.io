import { Metric } from './Metric';
import { PointND } from './PointND';

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


	private _valueMap : Map<string, Metric>;
	public get valueMap() : Map<string, Metric> {
		return this._valueMap;
	}
	// public set valueMap(v : Map<string, Metric>) {
	// 	this._valueMap = v;
	// }

	public addValue(key: string, value: number): void
	{
		const m = new Metric(value);
		this._valueMap.set(key, m);
	}

	private _pointArray : PointND[];
	public get pointArray() : PointND[] {
		return this._pointArray;
	}

	public addPoint(point: PointND): void
	{
		this._pointArray.push(point);
	}
	// public set pointArray(v : PointND[]) {
	// 	this._pointArray = v;
	// }

/*	public toString = () : string =>
	{
		return "test q123";
	}*/

}
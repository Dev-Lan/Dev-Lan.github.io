import { Metric } from './Metric';
import { StringToNumberObj } from '../lib/DevLibTypes'

export class PointND {

	constructor(pojo?: StringToNumberObj)
	{
		this._valueMap = new Map<string, Metric>();
		for (let key in pojo)
		{
			const m = new Metric(pojo[key]);
			this._valueMap.set(key, m);
		}
	}

	private _valueMap : Map<string, Metric>;
	public get valueMap() : Map<string, Metric> {
		return this._valueMap;
	}

	public addValue(key: string, value: number)
	{
		const m = new Metric(value);
		this.valueMap.set(key, m);
	}

	// public toString(): string
	// {
	// 	return "test";
	// }

	// todo add value from function

	// public static createPoint(): PointND
	// {
	// 	const p = new PointND();
	// 	return p;
	// }
}
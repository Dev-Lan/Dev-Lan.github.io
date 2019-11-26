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
		this._inBrush = true;
	}

	private _valueMap : Map<string, Metric>;
	public get valueMap() : Map<string, Metric> {
		return this._valueMap;
	}

	private _inBrush : boolean;
	public get inBrush() : boolean {
		return this._inBrush;
	}

	public set inBrush(v: boolean) {
		this._inBrush = v;
	}

	public addValue(key: string, value: number)
	{
		const m = new Metric(value);
		this.valueMap.set(key, m);
	}

	public get(key: string): number | undefined
	{
		let metric = this.valueMap.get(key);
		if (metric)
		{
			return metric.value;
		}
		return undefined;
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
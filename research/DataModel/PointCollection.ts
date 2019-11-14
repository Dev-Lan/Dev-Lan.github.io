import { PointND } from './PointND';

export abstract class PointCollection implements Iterable<PointND>, ArrayLike<PointND> {
	
	constructor()
	{
		this._attributeList = [];
		this._length = 0;
	}

	abstract [Symbol.iterator](): Iterator<PointND>;

	protected _length : number;
	public get length() : number {
		return this._length;
	}

	[n: number]: PointND;

	private _attributeList : string[];
	public get attributeList() : string[] {
		if (this._attributeList.length === 0)
		{
			this.initAttributeList();
		}
		return this._attributeList;
	}

	private initAttributeList(): void
	{
		let pointList = [...this];
		if (pointList.length > 0)
		{
			let point = pointList[0];
			for (let key of point.valueMap.keys())
			{
				this._attributeList.push(key);
			}
		}
	}

	public getMinMax(key: string): [number, number]
	{
		let minN: number = Infinity;
		let maxN: number = -Infinity;

		for (let point of this)
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



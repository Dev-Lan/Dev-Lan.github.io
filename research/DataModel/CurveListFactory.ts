import * as d3 from 'd3';
import { DevlibMath } from '../lib/DevlibMath';
import { CurveND } from './CurveND';
import { PointND } from './PointND';
import { StringToStringObj, StringToNumberObj } from '../lib/DevLibTypes'

interface StringToNumberOrList {
    [key: string]: number | StringToNumberObj[];
}

export class CurveListFactory {
	
	// constructor(argument) {
	// 	// code...
	// }

	public static CreateCurveListFromCSV(csvString: string, idkey: string = "id", tKey: string = "t"): CurveND[]
	{
		const curveList: CurveND[] = [];

		let rawValueArray: d3.DSVRowArray<string> = d3.csvParse(csvString);
		console.log(rawValueArray);

		let pojoList = d3.nest<StringToStringObj, StringToNumberOrList>()
			.key(d => d[idkey])
			.rollup((rows: any[]) =>
			{ 
				const values: StringToNumberOrList = {};
				const points: StringToNumberObj[] = [];
				for (let row of rows)
				{
					const tValue: string = row[tKey];
					if (!DevlibMath.isNumber(tValue))
					{

						for (let key in row)
						{
							if (key === idkey || key === tKey)
							{
								continue;
							}
							const value = row[key];
							if (!DevlibMath.isNumber)
							{
								continue;
							}
							values[tValue] = +value;
							break;
						}
						continue;
					}
					const point: StringToNumberObj = {};

					for (let key in row)
					{
						if (key === idkey)
						{
							continue;
						}
						point[key] = +row[key];
					}
					points.push(point);
				}
				const sortFunction = DevlibMath.sortOnProperty<StringToNumberObj>(obj => obj[tKey]);
				points.sort(sortFunction);

				values.points = points;
				return values;
			})
			.entries(rawValueArray);

		for (let plainCurve of pojoList)
		{
			const curve = new CurveND(plainCurve.key);
			for (let key in plainCurve.value)
			{
				let value = plainCurve.value[key];
				if (typeof value === "number")
				{
					curve.addValue(key, value);
					continue;
				}
				for (let pojoPoint of value)
				{
					const point = new PointND(pojoPoint);
					curve.addPoint(point);
				}
			}
			curveList.push(curve);
		}
		console.log(curveList);
		return curveList;
	}

}
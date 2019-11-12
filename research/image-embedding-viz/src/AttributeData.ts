import {ButtonProps} from '../../lib/DevLibTypes';
import {pointWithImage, attributeSelector} from './types';


export class AttributeData {
	
	constructor()
	{
		this._minMaxLookup = new Map();
		this._attributeKeys = [];
	}

	private _data : pointWithImage[];
	public get data() : pointWithImage[] {
		return this._data;
	}

	private _attributeKeys : string[];
	public get attributeKeys() : string[] {
		return this._attributeKeys;
	}

	private _minMaxLookup : Map<string, [number, number]>;
	private get minMaxLookup() : Map<string, [number, number]> {
		return this._minMaxLookup;
	}

	public onDataChange(data: pointWithImage[]): void
	{
		this._data = data;
		if (data.length > 0)
		{
			let firstAttributes = data[0].attributes;
			if (firstAttributes)
			{
				this._attributeKeys = Object.keys(firstAttributes);
			}
			else
			{
				this._attributeKeys = [];
			}
		}
		this.minMaxLookup.clear();
	}

	public getMinMax(key: string): [number, number]
	{
		if (!this.minMaxLookup.has(key))
		{
			this.calculateMinMax(key)
		}
		return this.minMaxLookup.get(key);
	}

	public getButtonProps(callbackFunction: (key: string, selector: attributeSelector) => any, skipNone = false): ButtonProps[]
	{
		let buttonPropList: ButtonProps[] = [];

		if (!skipNone)
		{
			let noneSelect: ButtonProps = {
				displayName: "None",
				callback: () => {
						let selector: attributeSelector;
						selector = p => p.attributes["None"].value;
						callbackFunction("None", selector);
					}
			};
			buttonPropList.push(noneSelect);
		}

		// this._currentSortSelector = (d: pointWithImage) => d.x;

		let axisOptions: ButtonProps[] = [
			{ displayName: "X-Axis", callback: () =>
				{
					let selector: attributeSelector = (d: pointWithImage) => d.x;
					callbackFunction("X-Axis", selector);
				}
			},
			{ displayName: "Y-Axis", callback: () =>
				{
					let selector: attributeSelector = (d: pointWithImage) => d.y;
					callbackFunction("Y-Axis", selector);				}
			}
		];
		buttonPropList.push(...axisOptions);
		for (let key of this.attributeKeys)
		{
			let buttonProps: ButtonProps = {
				displayName: key,
				callback: () => {
					let selector: attributeSelector;
					selector = p => p.attributes[key].value;
					callbackFunction(key, selector);
				}
			};
			buttonPropList.push(buttonProps);
		}
		return buttonPropList;
	}

	private calculateMinMax(key: string): void
	{
		let minSoFar: number = Infinity;
		let maxSoFar: number = -Infinity;
		for (let point of this.data)
		{
			let val: number;
			if (key === "X-Axis")
			{
				val = point.x;
			}
			else if (key === "Y-Axis")
			{
				val = point.y;
			}
			else
			{
				val = point.attributes[key].value;
			}
			if (val > maxSoFar)
			{
				maxSoFar = val;
			}
			if (val < minSoFar)
			{
				minSoFar = val;
			}
		}

		this.minMaxLookup.set(key, [minSoFar, maxSoFar]);
	}
}
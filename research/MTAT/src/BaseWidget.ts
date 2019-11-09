import {BaseComponent} from './BaseComponent';
// import {Margin} from '../../lib/DevLibTypes';

export abstract class BaseWidget<DataType> extends BaseComponent {
	
	// constructor(container: Element)
	// {
	// 	super(container);
	// }


	private _data : DataType | null;
	public get data() : DataType | null {
		return this._data;
	}

	// private _vizWidth : string;
	// public get vizWidth() : string {
	// 	return this._vizWidth;
	// }
	// public set vizWidth(v : string) {
	// 	this._vizWidth = v;
	// }

	// private _margin : Margin;
	// public get margin() : Margin {
	// 	return this._margin;
	// }

	public SetData(data: DataType): void
	{
		this._data = data;
		this.OnDataChange();
	}

	protected abstract OnDataChange(): void
}
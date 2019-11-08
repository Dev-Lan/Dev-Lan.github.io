import {BaseComponent} from './BaseComponent';
// import {Margin} from '../../lib/DevLibTypes';

export abstract class BaseWidget<DataType> extends BaseComponent {
	
	// constructor(container: Element)
	// {
	// 	super(container);
	// }


	private _width : number;
	public get width() : number {
		return this._width;
	}

	private _height : number;
	public get height() : number {
		return this._height;
	}

	private _data : DataType;
	public get data() : DataType {
		return this._data;
	}
	// public set data(v : DataType) {
	// 	this._data = v;
	// }

	// private _margin : Margin;
	// public get margin() : Margin {
	// 	return this._margin;
	// }

	public OnDataChange(data: DataType): void
	{
		this._data = data;

	}

	public OnResize(width: number, height: number): void
	{
		this._width = width;
		this._height = height;
	}

}
export class FunctionData {
	constructor(name: string)
	{
		this._name = name;
		this.yValues = [];
		this.depth = 0;
		this.isOutlier = false;
	}

	private _name : string;
	public get name() : string {
		return this._name;
	}
	public set name(v : string) {
		this._name = v;
	}

	private _index : number;
	public get index() : number {
		return this._index;
	}
	public set index(v : number) {
		this._index = v;
	}

	private _yValues : number[];
	public get yValues() : number[] {
		return this._yValues;
	}
	public set yValues(v : number[]) {
		this._yValues = v;
	}

	private _depth : number;
	public get depth() : number {
		return this._depth;
	}
	public set depth(v : number) {
		this._depth = v;
	}

	private _isOutlier : boolean;
	public get isOutlier() : boolean {
		return this._isOutlier;
	}
	public set isOutlier(v : boolean) {
		this._isOutlier = v;
	}

	private _selectedHexColor : string;
	public get selectedHexColor() : string {
		return this._selectedHexColor;
	}
	public set selectedHexColor(v : string) {
		this._selectedHexColor = v;
	}
}
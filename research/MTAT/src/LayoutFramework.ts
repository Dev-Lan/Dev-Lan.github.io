export class LayoutFramework {
	
	constructor(container: Element)
	{
		this._container = container;
	}

	private _container : Element;
	public get container() : Element {
		return this._container;
	}

	
}
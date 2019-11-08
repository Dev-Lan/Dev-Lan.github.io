export abstract class BaseComponent {
	
	constructor(container: Element)
	{
		this._container = container;
		this.init();
	}

	private _container : Element;
	public get container() : Element {
		return this._container;
	}

	protected init(): void
	{
		let currentStyle = this.container.getAttribute("style")
		this.container.setAttribute("style", currentStyle + " background: #d02f2f;");
		this.container.textContent = "Derived Class 'init' function not implemented";
	}
}
export abstract class BaseComponent {
	
	constructor(container: Element)
	{
		this._container = container;
		this.setWidthHeight();
		this.init();
	}

	private _container : Element;
	public get container() : Element {
		return this._container;
	}

	private _width : number;
	public get width() : number {
		return this._width;
	}

	private _height : number;
	public get height() : number {
		return this._height;
	}

	protected init(): void
	{
		let currentStyle = this.container.getAttribute("style")
		this.container.setAttribute("style", currentStyle + " background: #d02f2f;");
		this.container.textContent = "Derived Class 'init' function not implemented";
	}

	public Resize(): void
	{
		this.setWidthHeight();
		this.OnResize();
	}

	private setWidthHeight(): void
	{
		let rect = this.container.getBoundingClientRect();
		this._width = rect.width;
		this._height = rect.height;
	}

	protected OnResize(): void
	{
		this.container.innerHTML = null;
		this.container.textContent = `Resized to: (${this.width}, ${this.height})
override BaseComponent.OnResizeDraw() to ensure content is resized correctly`;
	
	}
}
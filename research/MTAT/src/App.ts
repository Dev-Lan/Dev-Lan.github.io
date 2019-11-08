import {BaseWidget} from './BaseWidget';
import {LayoutFramework} from './LayoutFramework';
import {Frame} from './types';

export class App<DataType> {
	
	constructor(container: Element) {
		this._widgetList = [];
		this._layoutFramework = new LayoutFramework(container);
	}

	private _widgetList : BaseWidget<DataType>[];
	public get widgetList() : BaseWidget<DataType>[] {
		return this._widgetList;
	}

	private _layoutFramework : LayoutFramework;
	public get layoutFramework() : LayoutFramework {
		return this._layoutFramework;
	}

	public InitializeLayout(frame: Frame): void
	{
		console.log(frame);
	}

	public SetData(newData: DataType): void
	{
		for (let widget of this.widgetList)
		{
			widget.OnDataChange(newData);
		}
	}



	// public OnWindowResize(): void
	// {
	// 	for (let widget of this.widgetList)
	// 	{
	// 		// todo get real window
	// 		widget.OnResize(10, 10);
	// 	}
	// } 

}
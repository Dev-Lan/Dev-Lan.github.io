import {BaseWidget} from './BaseWidget';
import {BaseComponent} from './BaseComponent';
import {Toolbar} from './Toolbar';
import {Plot2dPathsWidget} from './Plot2dPathsWidget';
import {LayoutFramework} from './LayoutFramework';
import {Frame, ComponentType} from './types';

export class App<DataType> {
	
	constructor(container: Element) {
		this._componentList = [];
		this._layoutFramework = new LayoutFramework(container);
	}

	private _componentList : BaseComponent[];
	public get componentList() : BaseComponent[] {
		return this._componentList;
	}

	private _layoutFramework : LayoutFramework;
	public get layoutFramework() : LayoutFramework {
		return this._layoutFramework;
	}

	private _componentContainers : Map<Element, ComponentType>;
	public get componentContainers() : Map<Element, ComponentType> {
		return this._componentContainers;
	}

	public InitializeLayout(frame: Frame): void
	{
		// console.log(frame);

		this._componentContainers = this.layoutFramework.InitializeLayout(frame);
		for (let [container, componentType] of this.componentContainers)
		{
			this.InitializeComponent(componentType, container);
		}
	}

	private InitializeComponent(compontentType: ComponentType, container: Element): void
	{
		let newComponent: BaseComponent;
		switch (compontentType) {
			case ComponentType.Toolbar:
				newComponent = new Toolbar(container);
				break;
			case ComponentType.Plot2dPathsWidget:
				newComponent = new Plot2dPathsWidget(container);
				break;
			case ComponentType.Console:
			case ComponentType.TableWidget:
			case ComponentType.LevelOfDetailWidget:
			case ComponentType.MetricDistributionWidget:
			default:
				throw new Error(`Cannot Initialize Component of type: ${compontentType}`);
				break;
		}
		this.componentList.push(newComponent);
	}

	public SetData(newData: DataType): void
	{
		for (let component of this.componentList)
		{
			if (component instanceof BaseWidget)
			{
				component.OnDataChange(newData);
			}
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
import {BaseWidget} from './BaseWidget';
import {BaseComponent} from './BaseComponent';
import {Toolbar} from './Toolbar';
import {Plot2dPathsWidget} from './Plot2dPathsWidget';
import {Console} from './Console';
import {TableWidget} from './TableWidget';
import {LevelOfDetailWidget} from './LevelOfDetailWidget';
import {MetricDistributionWidget} from './MetricDistributionWidget';
import {LayoutFramework} from './LayoutFramework';
import {Frame, ComponentType} from './types';

export class App<DataType> {
	
	constructor(container: Element, fromCsv: (data: string) => DataType) {
		this._componentList = [];
		this._layoutFramework = new LayoutFramework(container);
		this._dataFromCSV = fromCsv;
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

	private _dataFromCSV : (data: string) => DataType;
	public get dataFromCSV() : (data: string) => DataType{
		return this._dataFromCSV;
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
				newComponent = new Toolbar(container, (data: string) => this.loadFromCsvString(data));
				break;
			case ComponentType.Plot2dPathsWidget:
				newComponent = new Plot2dPathsWidget(container);
				break;
			case ComponentType.Console:
				newComponent = new Console(container);
				break;
			case ComponentType.TableWidget:
				newComponent = new TableWidget(container);
				break;
			case ComponentType.LevelOfDetailWidget:
				newComponent = new LevelOfDetailWidget(container);
				break;
			case ComponentType.MetricDistributionWidget:
				newComponent = new MetricDistributionWidget(container);
				break;
			default:
				console.error(`Cannot Initialize Component of type: ${compontentType}`);
				break;
		}
		this.componentList.push(newComponent);
	}

	private loadFromCsvString(data: string): void
	{
		let newData: DataType = this.dataFromCSV(data);
		this.SetData(newData);
	}

	public SetData(newData: DataType): void
	{
		for (let component of this.componentList)
		{
			if (component instanceof BaseWidget)
			{
				component.SetData(newData);
			}
		}
	}

	public OnWindowResize(): void
	{
		for (let component of this.componentList)
		{
			component.Resize();
		}
	} 

}
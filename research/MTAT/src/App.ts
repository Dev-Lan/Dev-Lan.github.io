import * as d3 from 'd3';
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
import {ButtonProps} from '../../lib/DevLibTypes';
import {DataEvents} from '../../DataModel/DataEvents';

export class App<DataType> {
	
	constructor(container: HTMLElement, fromCsv: (data: string) => DataType, fromCsvObject: (data: d3.DSVRowArray<string>) => DataType) {
		this._container = container;
		this._componentList = [];
		this._layoutFramework = new LayoutFramework(container);
		this._dataFromCSV = fromCsv;
		this._dataFromCSVObject = fromCsvObject;
		document.addEventListener(DataEvents.brushChange, (e: Event) => {this.onBrushChange()})
	}

	private _container : HTMLElement;
	public get container() : HTMLElement {
		return this._container;
	}

	private _componentList : BaseComponent[];
	public get componentList() : BaseComponent[] {
		return this._componentList;
	}

	private _layoutFramework : LayoutFramework;
	public get layoutFramework() : LayoutFramework {
		return this._layoutFramework;
	}

	private _componentContainers : Map<HTMLElement, ComponentType>;
	public get componentContainers() : Map<HTMLElement, ComponentType> {
		return this._componentContainers;
	}

	private _dataFromCSV : (data: string) => DataType;
	public get dataFromCSV() : (data: string) => DataType{
		return this._dataFromCSV;
	}

	private _dataFromCSVObject : (data: d3.DSVRowArray<string>) => DataType;
	public get dataFromCSVObject() : (data: d3.DSVRowArray<string>) => DataType{
		return this._dataFromCSVObject;
	}

	public InitializeLayout(frame: Frame<ComponentType>): void
	{
		// console.log(frame);

		this._componentContainers = this.layoutFramework.InitializeLayout(frame);
		for (let [container, componentType] of this.componentContainers)
		{
			this.InitializeComponent(componentType, container);
		}
	}

	private InitializeComponent(compontentType: ComponentType, container: HTMLElement): void
	{
		let newComponent: BaseComponent;
		switch (compontentType) {
			case ComponentType.Toolbar:
				let buttonList: ButtonProps[] = [
					{displayName: "Firework Simulation", callback: () => this.fetchCsv('firework.csv')},
					{displayName: "Klein Bottle", callback: () => this.fetchCsv('klein.csv')}
				];

				newComponent = new Toolbar(container, (data: string) => this.loadFromCsvString(data), buttonList);
				break;
			case ComponentType.Plot2dPathsWidget:
				newComponent = new Plot2dPathsWidget(container, 'x', 'y');
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

	private fetchCsv(filename: string): void
	{
		d3.csv("../exampleData/" + filename).then(data =>
		{
			// console.log(data);
			let newData: DataType = this.dataFromCSVObject(data);
			// console.log(newData);
			this.SetData(newData)
		});
	}

	public SetData(newData: DataType): void
	{
		console.log("App.SetData: ");
		console.log(newData);
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

	private onBrushChange(): void
	{
		for (let component of this.componentList)
		{
			if (component instanceof BaseWidget)
			{
				component.OnBrushChange();
			}
		}
	}

}
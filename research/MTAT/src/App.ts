import * as d3 from 'd3';
import {BaseWidget} from './BaseWidget';
import {BaseComponent} from './BaseComponent';
import {Toolbar} from './Toolbar';
import {Plot2dPathsWidget} from './Plot2dPathsWidget';
import {Console} from './Console';
import {TableWidget} from './TableWidget';
import {LevelOfDetailWidget} from './LevelOfDetailWidget';
import {MetricDistributionWidget} from './MetricDistributionWidget';
import {Overlay} from './Overlay';
import {LayoutFramework} from './LayoutFramework';
import {Frame, ComponentType} from './types';
import {ButtonProps} from '../../lib/DevLibTypes';
import {DataEvents} from '../../DataModel/DataEvents';
import {LabelPosition} from './types';

export class App<DataType> {
	
	constructor(container: HTMLElement, fromCsv: (data: string) => DataType, fromCsvObject: (data: d3.DSVRowArray<string>) => DataType) {
		this._container = container;
		this._componentList = [];
		this._layoutFramework = new LayoutFramework(container);
		this._dataFromCSV = fromCsv;
		this._dataFromCSVObject = fromCsvObject;
		document.addEventListener(DataEvents.brushChange, (e: Event) => {this.onBrushChange()});
		this._overlay = new Overlay("overlayContainer");
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

	private _overlay : Overlay;
	public get overlay() : Overlay {
		return this._overlay;
	}
	public set overlay(v : Overlay) {
		this._overlay = v;
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
					// {displayName: "Firework Simulation", callback: () => this.fetchCsv('firework.csv')},
					// {displayName: "Klein Bottle", callback: () => this.fetchCsv('klein.csv')},
					{displayName: "Tutorial", callback: async () => this.runStorySteps() },
					{displayName: "Walk Up Slope", callback: () => this.fetchCsv('walkUpSlope.csv') }
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

	private async fetchCsv(filename: string): Promise<void>
	{
		await d3.csv("../exampleData/" + filename).then(data =>
		{
			// console.log(data);
			let newData: DataType = this.dataFromCSVObject(data);
			// console.log(newData);
			this.SetData(newData)
		});
		return;
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


	private async runStorySteps(): Promise<void>
	{
		await this.fetchCsv('run.csv');

		this.overlay.clearLabels();

		this.overlay.addLabel(
			document.getElementById("toolbarButton-Tutorial"),
			[60, 60],
			LabelPosition.Bottom,
			"This tool is for the analysis of multivariate trajectory motion. By uploading your own dataset you can start investigating your data. <br><br> In this tutorial, we will be analyzing motion data of a human running. This dataset was modified from the <a href='http://mocap.cs.cmu.edu/'>Carnegie Mellon MoCap database</a>.",
			true
			);


		let plotOfAllPathsList = this.componentList.filter(d => d instanceof Plot2dPathsWidget);
		let plotOfAllPaths: Plot2dPathsWidget = plotOfAllPathsList[0] as Plot2dPathsWidget;

		this.overlay.addLabel(
			document.getElementById("playButton"),
			[60, 60],
			LabelPosition.Right,
			"By pressing the play button we can see an animation of the motion.",
			true,
			() =>
			{
				plotOfAllPaths.playAnimation();
			});

		this.overlay.addLabel(
			plotOfAllPaths.container,
			[40, 40],
			LabelPosition.Right,
			"This top-down view shows a human running, where each dot is a single tracked point. The lines show a trace of the point over time.",
			true,
			() =>
			{
				plotOfAllPaths.pauseAnimation();
			});


		let histogramListContainer = document.getElementById('distributionPlotContainer');
		this.overlay.addLabel(
			histogramListContainer,
			[-10, 20],
			LabelPosition.Left,
			"These histograms show the distribution of different values recorded for every sampled point in the motion data.",
			false,
			);



		let variableSelectContainer = document.getElementById('toggleButtonContainer');
		this.overlay.addLabel(
			variableSelectContainer,
			[20, 20],
			LabelPosition.Left,
			"This widget lets you select the variables you want to see plots for. Removing vx, vy, and vz will hide the histograms.",
			false,
			() =>
			{
				(document.getElementById("MetricDistributionWidget-varSelect-vx") as HTMLButtonElement).click();
				(document.getElementById("MetricDistributionWidget-varSelect-vy") as HTMLButtonElement).click();
				(document.getElementById("MetricDistributionWidget-varSelect-vz") as HTMLButtonElement).click();
			});

		this.overlay.addLabel(
			variableSelectContainer,
			[20, 20],
			LabelPosition.Left,
			"This widget lets you select the variables you want to see plots for. Removing vx, vy, and vz will hide the histograms.",
			false,
			);

		let matrixContainer = document.getElementById('matrixWrapperContainer');
		this.overlay.addLabel(
			matrixContainer,
			[20, 20],
			LabelPosition.Right,
			"This widget lets you select the scatterplots you want to look at. Let’s add two views that show the runner from different angles.",
			false,
			() =>
			{
				(document.getElementById("MetricDistributionWidget-scatterSelect-2-0") as HTMLButtonElement).click();
				(document.getElementById("MetricDistributionWidget-scatterSelect-2-1") as HTMLButtonElement).click();
			});

		let scatterPlotListContainer = document.getElementById('scatterPlotOuterContainer');
		this.overlay.addLabel(
			scatterPlotListContainer,
			[-10, 20],
			LabelPosition.Left,
			"Here we can see the front view of the runner in the first scatterplot. In the second we see the side view.",
			false
			);

		let collapseButton = document.getElementById('MetricDistributionWidget-collapseButton') as HTMLButtonElement;
		this.overlay.addLabel(
			collapseButton,
			[60, 60],
			LabelPosition.Right,
			"To free space, you can clear the selection widget.",
			true,
			() =>
			{
				collapseButton.click();
			});

		let metricDistributionWidgetList = this.componentList.filter(d => d instanceof MetricDistributionWidget);
		let metricDistributionWidget: MetricDistributionWidget = metricDistributionWidgetList[0] as MetricDistributionWidget;
		let timeHistogramWidget = metricDistributionWidget.histogramWidgets[3];


		let timeHistogram = document.getElementById('MetricDistributionWidget-histogramContainer-time');
		this.overlay.addLabel(
			timeHistogram,
			[60, 60],
			LabelPosition.Bottom,
			"Let's focus on the time histogram.",
			false,
			() =>
			{
				timeHistogramWidget.MoveBrush([0, .2]);				
			});


		let playBackSpeed = 0.4;
		let lastAnimationTime: number;
		let brushStartVal = 0;
		let direction = 1;
		let animating = true;

		let updateBrush = (timestamp: number) =>
		{
			if (!animating)
			{
				return;
			}
			if (!lastAnimationTime)
			{
				lastAnimationTime = timestamp
			}
			let elapsedTime = timestamp - lastAnimationTime;
			brushStartVal += direction * playBackSpeed * elapsedTime / 1000;
			timeHistogramWidget.MoveBrush([brushStartVal, brushStartVal + 0.2]);
			lastAnimationTime = timestamp;
			if (brushStartVal > 1)
			{
				direction = -1;
			}
			if (brushStartVal < 0)
			{
				direction = 1;
			}
			window.requestAnimationFrame(updateBrush);
		}

		this.overlay.addLabel(
			timeHistogram,
			[60, 60],
			LabelPosition.Bottom,
			"You can drag your mouse in the histogram to select a range of data to focus on. This filter will be applied to the other visualizations. In this scenario, we have filtered to motion data between time 0 and 0.2.",
			false,
			() =>
			{
				window.requestAnimationFrame(updateBrush);
			});


		this.overlay.addLabel(
			timeHistogram,
			[60, 60],
			LabelPosition.Bottom,
			"You can also drag the window to focus on other ranges in the histogram.",
			false,
			() =>
			{
				animating = false;;
				timeHistogramWidget.MoveBrush(null);
			});


		let lengthHistogram = document.getElementById('MetricDistributionWidget-histogramContainer-length');
		let lengthHistogramWidget = metricDistributionWidget.histogramWidgets[4];

		this.overlay.addLabel(
			lengthHistogram,
			[60, 60],
			LabelPosition.Bottom,
			"In this dataset, the length parameter represents the length of the bones the tracking points are attached to. To further analyze the data you can filter to a specific bone length to see motion for different areas of the body, like the feet.",
			false,
			() =>
			{
				lengthHistogramWidget.MoveBrush([.052, .072]);
				animating = false;
				plotOfAllPaths.playAnimation();
			});

		this.overlay.addLabel(
			plotOfAllPaths.container,
			[40, 40],
			LabelPosition.Right,
			"While the non-feet tracking points are still included in the animation, the tracking points on the feet are bold and have trace lines to allow you to focus on them.",
			true,
			() =>
			{
				plotOfAllPaths.pauseAnimationAtTime(.7);
			});

		this.overlay.addLabel(
			plotOfAllPaths.container,
			[40, 40],
			LabelPosition.Right,
			"In this view, it is easier to do a more detailed analysis. For example, here you can see that the feet are only under the center of mass when planted.",
			true);


		this.overlay.addLabel(
			plotOfAllPaths.container,
			[40, 40],
			LabelPosition.Right,
			"Feel free to explore! <i class='fas fa-hiking'></i>",
			true);

		let expandButton = document.getElementById('MetricDistributionWidget-expandButton') as HTMLButtonElement;
		expandButton.click();
		this.overlay.showLabels();
	}

}
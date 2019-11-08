// import * as d3 from 'd3';
import {BaseWidget} from './BaseWidget';
import {CurveList} from '../../DataModel/CurveList';

export class Plot2dPathsWidget extends BaseWidget<CurveList> {
	
	// constructor(container: Element)
	// {
	// 	super(container);
	// }

	// private init(): void
	// {

	// }

	public OnDataChange(data: CurveList): void
	{
		super.OnDataChange(data);
		console.log(this.data);

	}




}
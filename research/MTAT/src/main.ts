import * as d3 from 'd3';
import { App } from './App';
import { CurveList } from '../../DataModel/CurveList';
import { CurveListFactory } from '../../DataModel/CurveListFactory';

let container: HTMLElement = document.getElementById("appContainer") as HTMLElement;
let app: App<CurveList> = new App<CurveList>(container, CurveListFactory.CreateCurveListFromCSV, CurveListFactory.CreateCurveListFromCSVObject);
window.onresize = () => app.OnWindowResize();

d3.json('../config/config-finished.json').then(data =>
{
	app.InitializeLayout(data);
});
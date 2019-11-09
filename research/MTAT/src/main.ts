import * as d3 from 'd3';
import { App } from './App';
import { CurveList } from '../../DataModel/CurveList';
import { CurveListFactory } from '../../DataModel/CurveListFactory';

let container: Element = document.getElementById("appContainer")
let app: App<CurveList> = new App<CurveList>(container, CurveListFactory.CreateCurveListFromCSV);
window.onresize = () => app.OnWindowResize();

d3.json('../config/config.json').then(data =>
{
	app.InitializeLayout(data);
});
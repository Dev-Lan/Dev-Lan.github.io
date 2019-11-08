import * as d3 from 'd3';
import { App } from './App';
import { CurveList } from '../../DataModel/CurveList';

let container: Element = document.getElementById("appContainer")
let app: App<CurveList> = new App<CurveList>(container);


d3.json('../config/config.json').then(data =>
{
	app.InitializeLayout(data);
});
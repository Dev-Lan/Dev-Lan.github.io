const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const sheetId = urlParams.get('sheetId');
const N = urlParams.get('n');
const intervalPattern = urlParams.get('intervalPattern');

d3.csv(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`).then(data =>
{
	let grouped = d3.group(data, d => d.Category);
	console.log(grouped);
	let intervalData = IntervalData.BuildData(grouped, N, intervalPattern);
	let timerDisplay = new IntervalTimerDisplay(intervalData, 'outer-container');
	timerDisplay.update();
	console.log(intervalData);
});

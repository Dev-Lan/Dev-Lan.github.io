const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const sheetId = urlParams.get('sheetId');
const N = urlParams.get('n');
const intervalPattern = urlParams.get('intervalPattern');
speedup = urlParams.get('speedup');
if (!speedup)
{
	speedup = 1;
}
else 
{
	speedup = +speedup;
}

d3.csv(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`).then(data =>
{
	let grouped = d3.group(data, d => d.Category);
	console.log(grouped);
	let intervalData = IntervalData.BuildData(grouped, N, intervalPattern, speedup);
	let timerDisplay = new IntervalTimerDisplay(intervalData, 'outer-container');
	console.log(intervalData);
});

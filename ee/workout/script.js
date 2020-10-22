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

if (!sheetId)
{

}
else if (!N)
{
	const Ns = [1,2,3,4];
	let outerSelect = d3.select('#outer-container').html(null);
	
	outerSelect
		.append('h1')
		.classed('huge label', true)
		.text('Workout Length');

	outerSelect.selectAll('a')
		.data(Ns)
		.join('a')
		.attr('href', d => window.location.href + `&n=${d}`)
		.classed('quick-select-button huge label', true)
		.text(d => `${d * 15} min`);
}
else
{
	d3.csv(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`).then(data =>
	{
		let grouped = d3.group(data, d => d.Category);
		console.log(grouped);
		let intervalData = IntervalData.BuildData(grouped, N, intervalPattern, speedup);
		let timerDisplay = new IntervalTimerDisplay(intervalData, 'outer-container');
		console.log(intervalData);

		document.addEventListener("keydown", event => {
			if (event.code === 'Space') {
				timerDisplay.togglePlayPause();
			}
		});
	});
}

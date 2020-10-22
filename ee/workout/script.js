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
	const baseUrl = window.location.href.split('?')[0];

	const outerSelect = d3.select('#outer-container').html(null);
	outerSelect
		.append('h1')
		.classed('huge label', true)
		.text('Interval Timer');

	outerSelect.append('input')
		.attr('type', 'search')
		.attr('id', 'sheet-searchbar')
		.attr('placeholder', 'Spreadsheet ID')
		.classed('searchbar full-width label', true)
		.on('search', event =>
		{
			let possibleId = document.getElementById('sheet-searchbar').value;


			d3.csv(`https://docs.google.com/spreadsheets/d/${possibleId}/gviz/tq?tqx=out:csv`)
			.then(data =>
				{
					if (data.columns.indexOf('Activity') === -1)
					{
						throw new Error('Spreadsheet does not have an "Activity" column.')
					}
					else if (data.columns.indexOf('Category') === -1)
					{
						throw new Error('Spreadsheet does not have a "Category" column.')
					}
					window.open(baseUrl + `?sheetId=${possibleId}`,"_self");
				})
			.catch(err =>
				{
					let errorMessage;
					switch (true)
					{
						case err.message.indexOf('404') >= 0:
							errorMessage = "That isn't a valid Google Spreadsheet ID."
							break;
						case err.message === 'Failed to fetch':
							errorMessage = 'Make sure your spreadsheet has been made public.'
							break;
						default:
							errorMessage = `Error: ${err.message}`;
							break;
					}
					
					d3.select('#error-message-container')
						.classed('no-display', false)
						.text(errorMessage);
				});



		});

	outerSelect.append('div')
		.attr('id', 'error-message-container')
		.classed('no-display error-message label large padding-20', true);

	outerSelect.append('p')
		.classed('label padding-20', true)
		.html('To use this timer, you need must provide a <a href="https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id">Google Spreadsheet ID</a> with your list of workouts. This spreadsheet <a href="https://support.google.com/docs/answer/183965">must be published</a> and contain an <b>Activity</b> column as well as a <b>Category</b> column. The "warm-up" and "stretch" categories will be used at the beginning/end of the workout. The main workout will alternate between any other categories.');


	outerSelect.append('h1')
		.classed('large label', true)
		.text('Examples:');


	const exampleWorkouts = [
		['1MZb_DdKkZBppuY1t3TuDllCtIlmUy8BWPYNiceEIgUI', 'Upper/Core'],
		['1zldHzsKdi90A5HdJLdkWhT1BPCDNDFMd1vxIF753jc8', 'Upper/Lower/Core']
	];

	outerSelect
	  .append('div')
	  	.classed('display-flex flex-dir-row full-width', true)
	  .selectAll('div')
		.data(exampleWorkouts)
		.join('div')
		.classed('label display-flex row full-width', true)
	  .selectAll('div')
		.data(d => [[d[1]], [`${baseUrl}?sheetId=${d[0]}`, 'Timer'], [`https://docs.google.com/spreadsheets/d/${d[0]}/edit#gid=0`, 'Spreadsheet']])
		.join('div')
		.classed('cell', true)
		.html(d => d.length === 1 ? d[0] : `<a href="${d[0]}">${d[1]}</a>`);
}
else if (!N)
{
	const Ns = [1,2,3,4];
	const outerSelect = d3.select('#outer-container').html(null);
	
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

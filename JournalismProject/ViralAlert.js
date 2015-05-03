var gameHolderDiv;
var viralName;
var viralType;

var percentDone;
var peopleExposed;
var sites;
var users;
var exposedUsers;
var totalNumberOfInternetUsers;
var timestep;
var totalTime;
var timeElapsed;
var stepper; // used to end doStep
var tableRows; // used to update table
var gameOver;

function initializeData() {
	percentDone = "0.0";
	peopleExposed = 1;
	sites = ["facebook", "twitter", "reddit", "imgur", "instagram", "tumblr", "4chan", "google+", "youtube"];
	users = [1415000000, 288000000, 100000000, 100000000, 300000000, 230000000, 18000000, 300000000, 1000000000];
	peopleExposed = 1;
	exposedUsers = [1,0,0,0,0,0,0,0,0];
	// user stats taken from the following sites
	// http://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/
	// http://www.quora.com/How-many-registered-users-does-Reddit-currently-have
	// http://www.theatlantic.com/technology/archive/2013/12/imgur-the-biggest-little-site-in-the-world/281872/
	// https://www.youtube.com/yt/press/statistics.html
	// http://www.quora.com/How-many-active-users-does-4chan-have
	totalNumberOfInternetUsers = 3000000000;
	//http://www.internetlivestats.com/internet-users/
	gameOver = false;
	timestep = 200; // in milliseconds
	totalTime = 48000; // 48 hours at one second per hour
	timeElapsed = 0;
	tableRows = [];

}

function initializeDom() {
	//progess bar
    var progress = document.createElement("div");
    progress.setAttribute("class", "progress");
    var progressBar = document.createElement("div");
    progressBar.setAttribute("class", "progress-bar");
    progressBar.setAttribute("id", "progressBar");
    progressBar.style.width = percentDone+"%";
    progress.appendChild(progressBar);
    gameHolderDiv.appendChild(progress);
    // todo time scale

    // info section
    var infoDiv = document.createElement("div");
    infoDiv.setAttribute("class", "information");
    infoDiv.setAttribute("id", "aside");
    var heading = document.createElement("h2");
    heading.innerText = "Have you heard about \""+viralName+"\"?";

    var infoTable = document.createElement("table");
    var infoTableCategories = document.createElement("tr");

    var category = document.createElement('td');
    category.innerText = "Website";
    infoTableCategories.appendChild(category);

    category = document.createElement('td');
    category.innerText = "Exposed";
    infoTableCategories.appendChild(category);

 	category = document.createElement('td');
    category.innerText = "Ignorant";
    infoTableCategories.appendChild(category);

    category = document.createElement('td');
    category.innerText = "Percent Exposed";
    infoTableCategories.appendChild(category);

    infoTable.appendChild(infoTableCategories);

    for (var i = 0; i < sites.length; i++) {
    	var tableRow = document.createElement('tr');

    	var site = document.createElement('td');
    	site.innerText = sites[i];
    	tableRow.appendChild(site);

    	var exposed = document.createElement('td');
    	exposed.innerText = exposedUsers[i].toLocaleString();
    	tableRow.appendChild(exposed);

    	var ignorant = document.createElement('td');
    	ignorant.innerText = (users[i] - exposedUsers[i]).toLocaleString();
    	tableRow.appendChild(ignorant);

    	var percent = document.createElement('td');
    	var percentage = (exposedUsers[i] / users[i])*100;
    	percent.innerText = percentage.toPrecision(4) + "%";
    	tableRow.appendChild(percent);
    	tableRows.push(tableRow);
    	infoTable.appendChild(tableRow);
    };

    var finalRow = document.createElement('tr');
    var site = document.createElement('td');
    site.innerText = "All internet users";
    finalRow.appendChild(site);

    var exposed = document.createElement('td');
    exposed.innerText = peopleExposed;
    finalRow.appendChild(exposed);

	var ignorant = document.createElement('td');
	ignorant.innerText = (totalNumberOfInternetUsers - peopleExposed).toLocaleString();
	finalRow.appendChild(ignorant);

    var percent = document.createElement('td');
    var percentage = (peopleExposed / totalNumberOfInternetUsers) * 100;
    percent.innerText = percentage.toPrecision(4)+"%";
    finalRow.appendChild(percent);
    infoTable.appendChild(finalRow);


    infoDiv.appendChild(heading);
    infoDiv.appendChild(infoTable);
    gameHolderDiv.appendChild(infoDiv);


    // d3 code
    var width = 960,
    height = 500;

    var force = d3.layout.force()
    .charge(-480)
    .linkDistance(150)
    .size([width, height]);

	var svg = d3.select(gameHolderDiv).append("svg")
	    .attr("width", width)
	    .attr("height", height);

	d3.json("graph.json", function(error, graph) {
	  force
	      .nodes(graph.nodes)
	      .links(graph.links)
	      .start();

	  var link = svg.selectAll(".link")
	      .data(graph.links)
	    .enter().append("line")
	      .attr("class", "link")
	      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

	  var node = svg.selectAll(".node")
	      .data(graph.nodes)
	    .enter().append("circle")
	      .attr("class", "node")
	      .attr("r", function(d) {return (d.size / 1415)*30 + 20; })
	      .attr("id",function(d) {return d.name;})
	      .style("fill", function(d) { return '#000000ff'; })
	      .call(force.drag);

	  node.append("title")
	      .text(function(d) { return d.name; });

	  force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

	    node.attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; });
	  });
	});


}

function updateSimulation() {
	timeElapsed += timestep;
	percentDone = 100*(timeElapsed / totalTime);
	// should use time.
	for (var i = 0; i < users.length; i++) {
		exposedUsers[i] += 100;
	};

}

function updateDom () {
	document.getElementById("progressBar").style.width = percentDone + "%";
	for (var i = 0; i < tableRows.length; i++) {
		children = tableRows[i].children;
		children[1].innerText = exposedUsers[i].toLocaleString(); // exposed
		children[2].innerText = (users[i]-exposedUsers[i]).toLocaleString(); // ignorant
		
		var percentage = (exposedUsers[i] / users[i])*100;
    	children[3].innerText = percentage.toPrecision(4) + "%"; // percent exposed
	};
	// update final row

}

function doStep() {
	updateSimulation();
	updateDom();
	if (percentDone >= 100) {
		window.clearInterval(stepper);
		// clean up.
	}
}

function beginGameplay() {
	initializeData();
	initializeDom();
	stepper = setInterval(doStep, timestep);
}

function initFormSubmit(e) {
	if (e.preventDefault) e.preventDefault();

	var initFormArr = document.getElementById("initForm").elements
	for (var i = initFormArr.length - 1; i >= 0; i--) {
		if (initFormArr[i].type == "text") {
			viralName = initFormArr[i].value;
		} else if (initFormArr[i].checked) {
			viralType = initFormArr[i].value;
		}

	};

	initForm = document.getElementById("initFormDiv");
	gameHolderDiv.removeChild(initForm);

	beginGameplay();

	return false;
}

function createInitForm() {
	var formHolder = document.createElement("div");
	formHolder.setAttribute("class", "initForm");
	formHolder.setAttribute("id", "initFormDiv");


	//form
	var form = document.createElement("form");
	form.setAttribute("id","initForm");
	// viral name
	var nameHeading = document.createElement("h2");
	nameHeading.innerText = "Choose a name for your sensation!";

	var nameInput = document.createElement("input");
	nameInput.setAttribute("type", "text");
	nameInput.setAttribute("name", "viralName");
	nameInput.setAttribute("placeholder","Name");
	nameInput.required = true;

	// radio choices
	var mediaTypeHeading = document.createElement("h2");
	mediaTypeHeading.innerText = "Select a mediaType!";


	var radioInput1 = document.createElement("input");
	radioInput1.setAttribute("type", "radio");
	radioInput1.setAttribute("name", "mediaType");
	radioInput1.setAttribute("value", "video");
	var buttonLabel1 = document.createElement("label");
	buttonLabel1.setAttribute("for", "video");
	buttonLabel1.innerText = "VIDEO";

	var radioInput2 = document.createElement("input");
	radioInput2.setAttribute("type", "radio");
	radioInput2.setAttribute("name", "mediaType");
	radioInput2.setAttribute("value", "audio");
	var buttonLabel2 = document.createElement("label");
	buttonLabel2.setAttribute("for", "audio");
	buttonLabel2.innerText = "AUDIO";

	var radioInput3 = document.createElement("input");
	radioInput3.setAttribute("type", "radio");
	radioInput3.setAttribute("name", "mediaType");
	radioInput3.setAttribute("value", "text");
	var buttonLabel3 = document.createElement("label");
	buttonLabel3.setAttribute("for", "text");
	buttonLabel3.innerText = "TEXT";

	var radioInput4 = document.createElement("input");
	radioInput4.setAttribute("type", "radio");
	radioInput4.setAttribute("name", "mediaType");
	radioInput4.setAttribute("value", "image");
	radioInput4.required = true;
	var buttonLabel4 = document.createElement("label");
	buttonLabel4.setAttribute("for", "image");
	buttonLabel4.innerText = "IMAGE";

	// submit
	var submitButton = document.createElement("input");
	submitButton.setAttribute("type","submit");
	// submitButton.setAttribute("onClick", "initFormSubmit()");

	// append to form
	form.appendChild(nameHeading);
	form.appendChild(nameInput);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(mediaTypeHeading);
	form.appendChild(radioInput1);
	form.appendChild(buttonLabel1);
	form.appendChild(document.createElement("br"));
	form.appendChild(radioInput2);
	form.appendChild(buttonLabel2);
	form.appendChild(document.createElement("br"));
	form.appendChild(radioInput3);
	form.appendChild(buttonLabel3);
	form.appendChild(document.createElement("br"));
	form.appendChild(radioInput4);
	form.appendChild(buttonLabel4);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(submitButton);

	var title = document.createElement("h1");
	title.innerText = "Customize your very own Viral Sensation!";
	formHolder.appendChild(title);
	formHolder.appendChild(form);

	return formHolder;
}

function startGame() {
	gameHolderDiv.removeChild(gameHolderDiv.children[0]);
	var initForm = createInitForm();
	gameHolderDiv.appendChild(initForm);

	var form = document.getElementById("initForm");
	if (form.attachEvent) {
	    form.attachEvent("submit", initFormSubmit);
	} else {
	    form.addEventListener("submit", initFormSubmit);
	}

}

function start() {
	gameHolderDiv = document.getElementById("gameHolder");

}

window.addEventListener( "load", start, false );

var gameHolderDiv;
var clickDisplayDiv;
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
var gameInProgress;

var MIN_SIZE;
var MAX_SIZE;
var AVE_PERCENT_INCREASE_PER_HOUR;
var incrementAmount;

var mouse = {x: 0, y: 0};

document.addEventListener('mousemove', function(e){ 
    mouse.x = e.clientX || e.pageX; 
    mouse.y = e.clientY || e.pageY 
}, false);

function initializeData() {
	percentDone = "0.0";
	peopleExposed = 0;
	sites = ["facebook", "twitter", "reddit", "imgur", "instagram", "tumblr", "4chan", "google+", "youtube"];
	users = [1415000000, 288000000, 100000000, 100000000, 300000000, 230000000, 18000000, 300000000, 1000000000];
	exposedUsers = [0,0,0,0,0,0,0,0,0];
	// user stats taken from the following sites
	// http://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/
	// http://www.quora.com/How-many-registered-users-does-Reddit-currently-have
	// http://www.theatlantic.com/technology/archive/2013/12/imgur-the-biggest-little-site-in-the-world/281872/
	// https://www.youtube.com/yt/press/statistics.html
	// http://www.quora.com/How-many-active-users-does-4chan-have
	totalNumberOfInternetUsers = 3000000000;
	//http://www.internetlivestats.com/internet-users/
	gameInProgress = false; // 
	timestep = 200; // in milliseconds
	totalTime = 48000; // 48 hours at one second per hour
	timeElapsed = 0;
	tableRows = [];
	MIN_SIZE = 2;
	MAX_SIZE = 10;
	AVE_PERCENT_INCREASE_PER_HOUR = 8;
	incrementAmount = 1;

}

function tutorial() {
	var tutorialDiv = document.createElement("div");
	tutorialDiv.setAttribute("class", "overlayDiv");
	tutorialDiv.setAttribute("id", "tutorialDiv");
	var tutorialImg = document.createElement("img");
	tutorialImg.setAttribute("src", "img/tutorial.png");
	tutorialDiv.appendChild(tutorialImg);
	var gotItButton = document.createElement("button");
	gotItButton.setAttribute("class","gameUI");
	gotItButton.setAttribute("onclick", "finishTutorial()");
	gotItButton.innerText = "Got It!";
	tutorialDiv.appendChild(gotItButton);
	gameHolderDiv.appendChild(tutorialDiv);
}


function initializeDom() {
	// click feedback holder
	clickDisplayDiv = document.createElement("div");
	clickDisplayDiv.setAttribute("id","clickDisplayDiv");
	gameHolderDiv.appendChild(clickDisplayDiv);

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
    infoDiv.setAttribute("class", "information fancyText");
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
    finalRow.setAttribute("id", "finalTableRow");

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

    force = d3.layout.force()
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
	      .style("stroke-width", function(d) { return Math.sqrt(2.0*d.value); });

	  var node = svg.selectAll(".node")
	      .data(graph.nodes)
	    .enter().append("g")
	      .attr("class", "node")
	      // .attr("transform", function(d) {return "scale(" + ((d.size/1415)*3 + 1.1 ) +")"; })
	      .attr("id",function(d) {return d.name;})
	      // .attr("onclick", function(d) { return increaseCount(d.index); })
	      // .style("fill", function(d) { return '#000000ff'; })
	      .call(force.drag);

	  node.append("title")
	      .text(function(d) { return d.name; });

	  node.append("use")
      .attr("xlink:href", function(d) {return "img/website-logos.svg#"+d.name ;} );

      node.on('click', function(d) { if (gameInProgress) {
      		displayClick(d);
	      	increaseCount(d.index);
	      }});

	  force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

	    node.attr("transform", function(d) {
	    	var scaleAmt = (exposedUsers[d.index] / 1415000000) * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
	    	return "scale("+ scaleAmt +") translate(" + d.x / scaleAmt + "," + d.y / scaleAmt + ")"; })
	  });
	});


}

function displayClick(d) {
	// var scaleAmt = (exposedUsers[d.index] / 1415000000) * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
	// var x = d.x / scaleAmt;
	// var y = d.y / scaleAmt;
	// console.log(currentEvent);
	var tempDisplayDiv = document.createElement("div");
	tempDisplayDiv.innerHTML = "<h1 class=\"fancyText\">+"+incrementAmount+"</h1>";
	// tempDisplayDiv.style.opacity = 1.0;
	// tempDisplayDiv.style.display = 'initial';
	tempDisplayDiv.style.position = "absolute";
	tempDisplayDiv.style.left = mouse.x + "px";
	tempDisplayDiv.style.top = mouse.y + "px";
	clickDisplayDiv.appendChild(tempDisplayDiv);
	fadeOut(tempDisplayDiv);
}

function fadeOut(el) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            clickDisplayDiv.removeChild(el);
        }
        // el.style.top = el.style.top + 1;
        var top = el.style.top.replace("px","");
        el.style.top = Math.round(top) + 4 + "px";
        el.style.opacity = op;
        el.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function increaseCount(index) {
	if (exposedUsers[index] < users[index]) {
		exposedUsers[index] += incrementAmount;
	}
	return;
}

function updateSimulation() {
	timeElapsed += timestep;
	percentDone = 100*(timeElapsed / totalTime);

	for (var i = 0; i < users.length; i++) {
		var increase = exposedUsers[i]*0.00005*AVE_PERCENT_INCREASE_PER_HOUR*timestep; // todo add randomness
		exposedUsers[i] += Math.round(increase);
		exposedUsers[i] = Math.min(users[i], exposedUsers[i]);
	};

	
	var mostExposedIndex = exposedUsers.indexOf(Math.max.apply(Math, exposedUsers));
	peopleExposed = 0;
	for (var i = 0; i < exposedUsers.length; i++) {
		if (i == mostExposedIndex) {
			peopleExposed += exposedUsers[i];
		} else {
			peopleExposed += (1585 / 2336) * exposedUsers[i];
		}
	};
	peopleExposed = Math.min(totalNumberOfInternetUsers, Math.round(peopleExposed));


	incrementAmount = Math.max(1, Math.round(0.01*peopleExposed));
	force.alpha(0.2);
}


function updateDom () {
	document.getElementById("progressBar").style.width = percentDone + "%";
	for (var i = 0; i < tableRows.length; i++) {
		var children = tableRows[i].children;
		children[1].innerText = exposedUsers[i].toLocaleString(); // exposed
		children[2].innerText = (users[i]-exposedUsers[i]).toLocaleString(); // ignorant
		
		var percentage = (exposedUsers[i] / users[i])*100;
    	children[3].innerText = percentage.toPrecision(4) + "%"; // percent exposed
	};
	// update final row
	var finalRow = document.getElementById("finalTableRow");
	var finalChildren = finalRow.children;
	finalChildren[1].innerText = peopleExposed.toLocaleString(); // total exposed
	finalChildren[2].innerText = (totalNumberOfInternetUsers - peopleExposed).toLocaleString(); // ignorant
	var percentage = (peopleExposed / totalNumberOfInternetUsers)*100;
	finalChildren[3].innerText = percentage.toPrecision(4) + "%"; 

}

function doStep() {
	updateSimulation();
	updateDom();
	if (percentDone >= 100) {
		window.clearInterval(stepper);
		gameInProgress = false;
		gameOver();
	}
}
function getStatus() {
	var percentExposed = peopleExposed / totalNumberOfInternetUsers;
	if(peopleExposed == 0) {
			return "You have to click the graph!";
	} else if (peopleExposed < 100) {
			return "I guess you have a couple Facebook friends";
	} else if (peopleExposed < 1000) {
			return  "Looks like you have a LOT of Facebook friends. congrats.";
	} else if (peopleExposed < 10000) {
			return viralName +" has earned you microfame! Emphasis on micro...";
	} else if (peopleExposed < 100000) {
			return "\""+viralName+"\" is so famous it could be a meme.";
	} else if (peopleExposed < 1000000) {
			return "Chocolate Rain, more like \""+viralName+"\" rain!";
	} else if (peopleExposed < 10000000) {
			return "The evoluton of \""+viralName+"\"!";
	} else if (peopleExposed < 100000000) {
			return "Who even remembers the Ice Bucket Challenge? It's all about the \""+viralName+"\" Challenge now!";
	} else if (peopleExposed < 2000000000) {
			return "Is \""+viralName+"\" black and blue or white and yellow? What a conundrum!";
	} else if (peopleExposed < 3000000000) {
			return "What does the \""+viralName+"\" say?";
	} else if (peopleExposed == totalNumberOfInternetUsers) {
			return "\"" + viralName + "\" is the new Gangnam Style! Neato!";
	}

	return "";
}

function removeGameOver() { gameHolderDiv.removeChild(document.getElementById("gameOverDiv")); }

function gameOver() {
	var gameOverDiv = document.createElement("div");
	gameOverDiv.setAttribute("class", "overlayDiv fancyText");
	gameOverDiv.setAttribute("id", "gameOverDiv");
	var h1 = document.createElement("h1");
	h1.innerText = "Game Over!";
	gameOverDiv.appendChild(h1);
	var h2 = document.createElement("h2");
	h2.innerText = getStatus();
	gameOverDiv.appendChild(h2);
	var newGameForm = document.createElement("form");
	
	var newGameButton = document.createElement("input");
	newGameButton.setAttribute("type","submit");
	newGameButton.setAttribute("value", "New Game");
	newGameButton.setAttribute("class","gameUI")
	newGameForm.appendChild(newGameButton);
	
	var playWithGraphThingy = document.createElement("button");
	playWithGraphThingy.setAttribute("class","gameUI")
	playWithGraphThingy.innerText = "Play with social graph thingy.";
	playWithGraphThingy.setAttribute("onclick","removeGameOver()");
	

	gameOverDiv.appendChild(newGameForm);
	gameOverDiv.appendChild(document.createElement("br"));
	gameOverDiv.appendChild(playWithGraphThingy);

	gameHolderDiv.appendChild(gameOverDiv);
}

function beginGameplay() {

	initializeData();
	initializeDom();
	tutorial();
}

function finishTutorial() {
	// this is where game play actually start. good function naming Devin...
	var tutorialDiv = document.getElementById("tutorialDiv");
	gameHolderDiv.removeChild(tutorialDiv);
	gameInProgress = true;
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
	formHolder.setAttribute("class", "fancyText");


	//form
	var form = document.createElement("form");
	form.setAttribute("id","initForm");
	// viral name
	var nameHeading = document.createElement("h2");
	nameHeading.innerText = "Choose a name.";

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
	submitButton.setAttribute("class", "gameUI");

	// append to form
	form.appendChild(nameHeading);
	form.appendChild(nameInput);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	// Decided to omit media type, but left construction of it in.
	// form.appendChild(mediaTypeHeading);
	// form.appendChild(radioInput1);
	// form.appendChild(buttonLabel1);
	// form.appendChild(document.createElement("br"));
	// form.appendChild(radioInput2);
	// form.appendChild(buttonLabel2);
	// form.appendChild(document.createElement("br"));
	// form.appendChild(radioInput3);
	// form.appendChild(buttonLabel3);
	// form.appendChild(document.createElement("br"));
	// form.appendChild(radioInput4);
	// form.appendChild(buttonLabel4);
	// form.appendChild(document.createElement("br"));
	// form.appendChild(document.createElement("br"));
	form.appendChild(submitButton);

	var title = document.createElement("h1");
	title.innerText = "Customize your very own Viral Sensation!";
	title.setAttribute("class", "fancyText");
	formHolder.appendChild(title);
	formHolder.appendChild(form);

	return formHolder;
}

function startGame() {
	gameHolderDiv.removeChild(gameHolderDiv.children[1]);
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
// 
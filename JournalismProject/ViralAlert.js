var gameHolderDiv;
var viralName;
var viralType;

var percentDone;
var peopleExposed;
var sites;
var users;
var exposedUsers;
var totalNumberOfInternetUsers;

var gameOver;

function initializeData() {
	percentDone = "10.0";
	peopleExposed = 1;
	sites = ["facebook", "twitter", "reddit", "imgur", "instagram", "tumblr", "4chan", "google+", "youtube"];
	users = [1415000000, 288000000, 70000000, 100000000, 300000000, 230000000, 300000000, 1000000000];
	peopleExposed = 1;
	exposedUsers = [1,0,0,0,0,0,0,0,0];
	// user stats taken from the following sites
	// http://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/
	// http://www.quora.com/How-many-registered-users-does-Reddit-currently-have
	// http://www.theatlantic.com/technology/archive/2013/12/imgur-the-biggest-little-site-in-the-world/281872/
	// https://www.youtube.com/yt/press/statistics.html
	totalNumberOfInternetUsers = 3000000000;
	//http://www.internetlivestats.com/internet-users/
	gameOver = false;
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
    heading.innerText = "Have you heard about "+viralName+"?";

    infoDiv.appendChild(heading);
    gameHolderDiv.appendChild(infoDiv);

    // display site graph

}

// function updateSimulation() {

// }

// function updateDom () {

// }

function beginGameplay() {
	initializeData();
	initializeDom();
	// while (!gameOver) {
	// 	updateSimulation();
	// 	updateDom();
	// }

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

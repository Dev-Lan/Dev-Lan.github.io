// CONSTANTS
var playing=false;
var intervalSeconds=1.0;

// global dom stuff
var codeContainer="";

// algorithm logic
var algorithm = null;
var currentLine = 1;
var done=100;

function startAlgorithm(algo) {
	algorithm = algo;
	init();
	algorithm.init();
}

function init() {
	var stepButton = document.getElementById("stepButton");
	stepButton.addEventListener("click", doStep);
	codeContainer = document.getElementById("code-container");
}

function doStep() {
	algorithm.doStep(currentLine);
}

function advanceLine(advance) {
	changeLine(currentLine + advance);
}

function goToLine(line) {
	changeLine(line);
}

function changeLine(newLine) {
	var lineElement = getLineElement(currentLine);
	resetClass(lineElement,"code-line");

	currentLine = newLine;
	var lineElement = getLineElement(currentLine)
	addClass(lineElement,"current-line");
}

function getLineElement(lineNum) {
	return document.getElementById("line-" + lineNum);
}

function addClass(element,newClass) {
	element.className = element.className + " " + newClass;
}

function resetClass(element,originalClass) {
	element.className = originalClass;
}

function stopExecution() {
	alert("done");
	// TODO
}

// Vector utility

function Vector2(x,y) {
	var Vector2 = new Object();
	Vector2.x = x;
	Vector2.y = y;
	return Vector2;
}

function addVectors(vec1,vec2) {
	return Vector2(vec1.x+vec2.x, vec1.y+vec2.y);
}

function subVectors(vec1, vec2) {
	return Vector2(vec1.x-vec2.x, vec1.y-vec2.y);
}

function scaleVector(vec, scale) {
	return Vector2(vec.x*scale, vec.y*scale);
}

function normalize(vec) {
	var mag = magnitude(vec);
	var unit = {}
	unit.x = vec.x / mag;
	unit.y = vec.y / mag;
	return unit;
}

function magnitude(vec) {
	return Math.sqrt(magnitudeSquared(vec));
}

function magnitudeSquared(vec) {
	return dot(vec,vec);
}

function dot(vec1,vec2) {
	return vec1.x*vec2.x + vec1.y*vec2.y;
}

// CONSTANTS
var ARRAY_CONTAINER_BORDER_WIDTH = 3;

var playing=false;
var intervalSeconds=1.0;

// global dom stuff
var arrayContainer="";
var codeContainer="";
var visContainer="";
var svgPathContainer="";
var leftPathElement="";
var rightPathElement="";
var midPathElement="";

var svgHeight="";

// algorithm logic
var currentLine = 1;
var done=100;
var left="";
var right="";
var mid="";
var array=[];
var searchValue="";
var checkValue="";

// vis variables
var pointToPositions=[];
var leftPath=[];
var rightPath=[];
var midPath=[];

window.onload = function onload() {
	addEventListeners();
	initializeGraphics();
}

function addEventListeners() {
	var stepButton = document.getElementById("stepButton");
	stepButton.addEventListener("click", AdvanceState);
}

function initializeGraphics() {
	getDomElements();
	// TODO - Clean Code
	var height = codeContainer.clientHeight;
	var width = visContainer.clientWidth;
	var cells = arrayContainer.children;
	var numCells = cells.length;
	var cellSize = width / numCells;
	var arrayContainerHeight = cellSize + ARRAY_CONTAINER_BORDER_WIDTH*2;
	var topOfArrayContainer = height - arrayContainerHeight
	setHeight(arrayContainer, arrayContainerHeight);
	setWidth(arrayContainer, width);
	setTop(arrayContainer, topOfArrayContainer);
	width = width - ARRAY_CONTAINER_BORDER_WIDTH*2;
	cellSize = width / numCells;
	for (var i = 0; i < numCells; i++) {
		setElementSizePos(cells[i], cellSize, i*cellSize, 0);
		var valueDiv = cells[i].children[0];
		var indexDiv = cells[i].children[1];
		var margin = cellSize/10
		var indexSize = cellSize / 2.5;
		var indexLeft = cellSize - indexSize;
		setElementSizePos(indexDiv, indexSize, indexLeft, margin);
	}
	setSvgContainerBounds(width + 2*ARRAY_CONTAINER_BORDER_WIDTH , topOfArrayContainer);
	setIndexPointToPositions();
	// ---------------- TODO -------------------
}

function getDomElements() {
	codeContainer = document.getElementById("code-container");
	arrayContainer = document.getElementById("array-container");
	visContainer = document.getElementById("vis-container");
	svgPathContainer = document.getElementById("svg-path-container");
	leftPathElement = document.getElementById("left-path"); 
	rightPathElement = document.getElementById("right-path");
	midPathElement = document.getElementById("mid-path");
}

function setHeight(element, height) {
	element.style.height = height + "px";
}

function setWidth(element, width) {
	element.style.width = width + "px";
}

function setTop(element, top) {
	element.style.top = top + "px";
}

function setElementSizePos(element, size, left, top) {
	element.style.width = size + "px";
	element.style.height = size + "px";
	element.style.left = left + "px";
	element.style.top = top + "px";
}

function setSvgContainerBounds(width, height) {
	setWidth(svgPathContainer,width);
	setHeight(svgPathContainer,height);
	svgHeight = height;
}

function setIndexPointToPositions() {
	for (var i = 0; i < arrayContainer.children.length; i++) {
		var thisX = calculateElementPos(arrayContainer.children[i], 0.75);
		pointToPositions.push(thisX);
	}
}

function calculateElementPos(element, percent) {
	return parseFloat(element.style.left) + parseFloat(element.style.width)*percent;
}

function getArrayToSearch() {
	var result = []
	for (var i = 0; i < arrayContainer.children.length; i++) {
		elementValue = parseFloat(arrayContainer.children[i].children[0].innerHTML);
		result.push(elementValue);
	}
	return result;
}

function getSearchValue() {
	var inputEl = document.getElementById("searchValue");
	return parseInt(inputEl.value);
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

function AdvanceState() {
	// alert("line: "+currentLine);
	switch(currentLine) {

		case 1:
			array = getArrayToSearch();
			searchValue = getSearchValue();
			advanceLine(1);
			initLeftPath();
			renderPointsToPath(leftPathElement, leftPath);
			break;
		case 2:
			left = 0;
			advanceLine(1);
			initRightPath();
			renderPointsToPath(rightPathElement, rightPath);
			break;
		case 3:
			right = array.length-1;
			advanceLine(1);
			break;
		case 4:
			advanceLine(1);
			break;
		case 5:
			if (left > right) {
				advanceLine(1);
			} else {
				advanceLine(2);
			}
			break;
		case 6:
			mid = -1; // did not find :( 
			goToLine(done);
			break;
		case 7:
			mid = (left + right) / 2.0
			setMidPath(Math.floor(mid));
			renderPointsToPath(midPathElement, midPath);
			advanceLine(1);
			break;
		case 8:
			mid = Math.floor(mid);
			advanceLine(1);
			break;
		case 9:
			checkValue = array[mid];
			advanceLine(1);
			break;
		case 10:
			if (checkValue > searchValue) {
				advanceLine(1);
				updatePath(rightPath, mid-1);
				renderPointsToPath(rightPathElement, rightPath);
			} else {
				advanceLine(2);
			}
			break;
		case 11:
			right = mid - 1;
			resetMidPath();
			goToLine(4);
			break;
		case 12:
			if (checkValue < searchValue) {
				advanceLine(1);
				updatePath(leftPath, mid+1);
				renderPointsToPath(leftPathElement, leftPath);
			} else {
				advanceLine(2);
			}
			break;
		case 13:
			left = mid +1;
			resetMidPath();
			goToLine(4);
			break;
		case 14:
			advanceLine(1);
			break;
		case 15:
			goToLine(done);
			break;
		case done:
			stopExecution();
	}
}

// TODO - read past devin's thoughts. In short there is a big issue in cleanliness here in
// 		  distinguishing the order of exection of a single line. it's pretty muddled.

function stopExecution() {
	alert("done");
	// TODO
}

// TODO combine left/right into one function
function initLeftPath() {
	initPath(leftPath, 0);
}

function initRightPath() {
	initPath(rightPath, 15);
}

function setMidPath(index) {
	initPath(midPath, index);
}

function initPath(pathArray, index) {
	var botMargin = 10;
	var y = 50;
	var x = pointToPositions[index];
	pathArray.push( Vector2(x,y) );
	y = svgHeight - botMargin;
	pathArray.push( Vector2(x,y) );
}

function resetMidPath() {
	midPath = [];
	renderPointsToPath(midPathElement, midPath);
}

function updatePath(pathArray, index) {
	var botMargin = 10;
	var y = svgHeight - botMargin;
	var x = pointToPositions[index];
	pathArray.push( Vector2(x,y) );
	bumpUp(pathArray, pathArray.length-2);
}

function bumpUp(pathArray, index) {
	var oldPoint = pathArray[index];
	var x = oldPoint.x;
	var y = oldPoint.y * (1 - Math.pow(2, -(index+1)));
	var newPoint = Vector2(x,y);
	pathArray[index] = newPoint;
}

function renderPointsToPath(pathElement, arrayOfPoints) {
	var pathString = createPathString(arrayOfPoints);
	pathElement.setAttribute("d", pathString);
}

function createPathString(arrayOfPoints) {
	if ( arrayOfPoints.length === 0) {
		return "";
	}
	var pathString = "M"+arrayOfPoints[0].x + " " + arrayOfPoints[0].y + " ";
	for (var i = 0; i < arrayOfPoints.length; i++) {
		var point = arrayOfPoints[i];
		pathString = pathString + "L" + point.x + " " + point.y + " ";
	}
	return pathString;
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

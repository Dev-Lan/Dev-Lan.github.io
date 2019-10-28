var NAVBAR_HEIGHT = 60;
var container={};
var balls=[]
var lastTime;
var animating=true;
var mousePos = Vector2(0,0);
var mouseDown=false;
var startingPosD = [{"x":1, "y":1}, {"x":2, "y":1}, {"x":3, "y":1}, {"x":4, "y":1},
					{"x":1, "y":2},                                                  {"x":5, "y":2},
					{"x":1, "y":3},                                                    {"x":6, "y":3},
					{"x":1, "y":4},                                                     {"x":7, "y":4},
					{"x":1, "y":5},                                                     {"x":7, "y":5},
					{"x":1, "y":6},                                                     {"x":7, "y":6},
					{"x":1, "y":7},                                                     {"x":7, "y":7},
					{"x":1, "y":8},                                                    {"x":6, "y":8},
					{"x":1, "y":9},                                   {"x":4, "y":9}, {"x":5, "y":9},
					{"x":1, "y":10}, {"x":2, "y":10}, {"x":3, "y":10}
					 ]
var startingPosL = [{"x":4, "y":6},
					{"x":4, "y":7},
					{"x":4, "y":8},
					{"x":4, "y":9},
					{"x":4, "y":10},
					{"x":4, "y":11},
					{"x":4, "y":12},
					{"x":4, "y":13},
					{"x":4, "y":14},
					{"x":4, "y":15},{"x":5, "y":15},{"x":6, "y":15},{"x":7, "y":15},{"x":8, "y":15},{"x":9, "y":15},{"x":10, "y":15} ]


window.onload = function onload() {
	initialize();
	animateLoop();
}

function initialize() {
	initializeContainer("animateContainer");
	var fillPercent = 0.7;
	var cellRadius = fillPercent * calculateCellRadius();
	var screenCenter = calculateCenterPoint();
	var DLCenter = scaleVector(Vector2(4,9), cellRadius);
	[startingPosD, startingPosL].forEach(function(initialGrid) {
		spreadGrid(initialGrid, cellRadius);
		centerGrid(initialGrid, screenCenter, DLCenter);
		initializeBalls(initialGrid, cellRadius);
	});
}

function calculateCellRadius() {
	var bounds = getClientBounds();
	var ratio = bounds.x / bounds.y;
	var DLRatio = 10 / 15;
	if (ratio > DLRatio) {
		return bounds.y / 15;
	} else {
		return bounds.x / 10;
	}
}

function calculateCenterPoint() {
	var bounds = getClientBounds();
	return scaleVector(bounds, 0.5);
}

function getClientBounds() {
	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight - NAVBAR_HEIGHT;
	return Vector2(width, height);
}

function initializeContainer(elementID) {
	element = document.getElementById(elementID);
	container.element = element;
	container.width = element.clientWidth;
	container.height = element.clientHeight;
}

function initializeBalls(initialGrid, cellRadius, bgColor) {
	var ballRadius = cellRadius;
	var ballMass = 5000; // constant ball mass so resizing for different screen sizes doesn't affect parameter tuning
	// var ballMass = Math.PI * ballRadius * ballRadius; // calculated
	for (var i = 0; i < initialGrid.length; i++) {
		var ballObj = BallObject(
						"",
						ballRadius,
						initialGrid[i],
						Vector2(0,0),
						Vector2(0,0),
						ballMass,
						initialGrid[i]
					  );

		createBallElement(ballObj, bgColor);
		balls.push(ballObj);
	}
}

function spreadGrid(grid,cellRadius) {
	for (var i = 0; i < grid.length; i++) {
		grid[i] = scaleVector(grid[i], cellRadius);
	}
}

function centerGrid(initialGrid, screenCenter, DLCenter) {
	var offset = subVectors(screenCenter, DLCenter);
	for (var i = 0; i < initialGrid.length; i++) {
		initialGrid[i] = addVectors(initialGrid[i], offset);
	}
}

function BallObject(element,radius,pos,vel,accel,mass,originalPos) {
	var ballObject = {};
	ballObject.element = element;
	ballObject.radius = radius;
	ballObject.pos = pos;
	ballObject.vel = vel;
	ballObject.accel = accel;
	ballObject.mass = mass;
	ballObject.originalPos = originalPos;
	return ballObject;
}


function createBallElement(ballObj, bgColor) {
	newElement = document.createElement("div");
	newElement.style.width = ballObj.radius + "px";
	newElement.style.height = ballObj.radius + "px";
	newElement.style.height = ballObj.radius + "px";
	newElement.style.height = ballObj.radius + "px";
	var top = ballObj.pos.y - ballObj.radius;
	var left = ballObj.pos.x - ballObj.radius;
	newElement.className = "simpleBall";
	if (bgColor !== "") {
		newElement.style.backgroundColor = bgColor;
	}
	setPos(newElement,top,left);
	ballObj.element = newElement;
	container.element.appendChild(newElement);
}

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

function animateLoop() {
	if (animating) {
	    requestAnimationFrame(animateLoop);
		var dt = Math.min(getTimePassed(), 100);
	    doStep(dt);
	}
}

function pause() {
	animating = false;
}

function play() {
	animating = true;
	animateLoop();
}

function doStep(dt) {
	updateState(dt);
	renderToHTML();
}

function getTimePassed() {
	var now = new Date().getTime();
    var dt = now - (lastTime || now);
	lastTime = now;
    return dt;
}

function updateState(dt) {
	
	// apply forces
	for (var i = 0; i < balls.length; i++) {
		resetAccel(balls[i]);
		var springForceConstant = 100000
		addSpringForce(balls[i], springForceConstant, 0.1 * springForceConstant);
		var mouseForceConstant = 8000000;
		if (mouseDown) {
			addMouseForce(balls[i], mouseForceConstant);		
		} else {
			addMouseForce(balls[i], 0.1 * mouseForceConstant);
		}
		// addGravity(balls[i], 250);
	}

	// move objects
	for (var i = 0; i < balls.length; i++) {
		integrateMotion(balls[i],dt / 1000);
	}

	// reset by position with constraints
	for (var i = 0; i < balls.length; i++) {
		// the order matters in how you prioritize constraints
		bounceBall(balls[i],container,.99);
		addSpringConstraint(balls[i], 2);
		mouseConstraint(balls[i], 2.5);
	}

}

function resetAccel(ballObj) {
	ballObj.accel = Vector2(0,0);
}

function addSpringForce(ballObj, springConstant, dampingConstant) {
	var toOriginalF = subVectors(ballObj.originalPos, ballObj.pos);
	toOriginalF = scaleVector(toOriginalF, springConstant);
	// damping
	if (dampingConstant === "") {
		dampingConstant = 0;
	}
	toOriginalF = addVectors(toOriginalF, scaleVector(ballObj.vel, -dampingConstant));

	ballObj.accel = addVectors(ballObj.accel, scaleVector(toOriginalF, 1.0 / ballObj.mass));
}

function addMouseForce(ballObj, forceMag) {
	var forceDir = subVectors(mousePos, ballObj.pos);
	var dist = magnitude(forceDir);
	ballObj.accel = addVectors(ballObj.accel, scaleVector(forceDir, forceMag / (ballObj.mass * dist)));
}

function addGravity(ballObj, magnitude) {
	ballObj.accel = addVectors(ballObj.accel, Vector2(0,magnitude));
}

function integrateMotion(ballObj, dt) {
	ballObj.vel = addVectors(ballObj.vel, scaleVector(ballObj.accel, dt));
	ballObj.pos = addVectors(ballObj.pos, scaleVector(ballObj.vel, dt));
}

function mouseConstraint(ballObj, offsetFactor) {
	var totalOffset = ballObj.radius * offsetFactor;
	var toMouse = subVectors(mousePos, ballObj.pos);
	var distSquared = magnitudeSquared(toMouse);
	if (distSquared > totalOffset * totalOffset) {
		return;
	}
	var fromMouse = scaleVector(toMouse,-totalOffset / Math.sqrt(distSquared));
	ballObj.pos = addVectors(mousePos,fromMouse);
	ballObj.vel = scaleVector(ballObj.vel,0.5);
}

function addSpringConstraint(ballObj, maxExtentFactor) {
	var maxExtent = ballObj.radius * maxExtentFactor;
	var toOriginal = subVectors(ballObj.originalPos, ballObj.pos);
	var distSquared = magnitudeSquared(toOriginal);
	if (distSquared < maxExtent * maxExtent) {
		return;
	}
	var fromOriginal = scaleVector(toOriginal, -maxExtent / Math.sqrt(distSquared));
	ballObj.pos = addVectors(ballObj.originalPos, fromOriginal);
}

function bounceBall(ballObj, bounds, bounceConstant) {
	var r = ballObj.radius;
	if (ballObj.pos.x < r) {
		ballObj.pos.x = r;
		ballObj.vel.x = bounceConstant * Math.abs(ballObj.vel.x); 
	} else if (ballObj.pos.x > bounds.width - r) {
		ballObj.pos.x = bounds.width - r;
		ballObj.vel.x = -bounceConstant * Math.abs(ballObj.vel.x);
	}
	if (ballObj.pos.y < r) {
		ballObj.pos.y = r;
		ballObj.vel.y = bounceConstant * Math.abs(ballObj.vel.y); 
	} else if (ballObj.pos.y > bounds.height - r) {
		ballObj.pos.y = bounds.height - r;
		ballObj.vel.y = -bounceConstant * Math.abs(ballObj.vel.y);
	}
}

function renderToHTML() {
	for (var i = 0; i < balls.length; i++) {
		renderBallToHTML(balls[i]);
	}
}

function renderBallToHTML(circleObj) {
	var element = circleObj.element;
	var top = circleObj.pos.y - circleObj.radius;
	var left = circleObj.pos.x - circleObj.radius;
	setPos(element,top,left);
}

function setPos(element,top,left) {
	element.style.top=top + "px";
	element.style.left=left + "px";
}

function updateMousePos(event) {
	mousePos.x = event.clientX;
	mousePos.y = event.clientY - NAVBAR_HEIGHT;
}

function handleMouseDown(event) {
	mouseDown = true;
}

function handleMouseUp(event) {
	mouseDown = false;
}

function handleTouchEvent(event) {
	let touchList = event.targetTouches;
	if (touchList.length === 0)
	{
		mouseDown = false;
		mousePos.x = 0;
		mousePos.y = 0;
		return;
	}
	mouseDown = true;
	firstTouch = event.targetTouches[0];
	mousePos.x = firstTouch.clientX;
	mousePos.y = firstTouch.clientY - NAVBAR_HEIGHT;
}
//This code is born from the 'sperm' code on http://paperjs.org/features/
/*
 * Set Styles
 */
project.currentStyle = {
	strokeColor: 'black',
	strokeWidth: 4,
	strokeCap: 'round'
};
/*
 * Set up game variables and other tasks
 */

//Dictonary to Array function
Object.prototype.toArray = function(){
    var arr = [];
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        arr.push(this[key]);
      }
    }
    return arr;
};

//Game Variables
var GAME = {
	paused 	: false,
	pause 	: function(){this.paused = true;},
	unpause : function(){this.paused = false;},
	objects	: {}
};

//function called on each iteration
function onFrame(event) {
	if (typeof ship !== 'undefined' && !GAME.paused){
		//Check collisions
		ship.starInteractions();

		//Process keyStrokes
		if (Key.isDown('up')){
			ship.thrust();
		}else{
			if (Key.isDown('left'))
			    ship.left();

			if (Key.isDown('right'))
				ship.right();
		}
		
		// Only draw every-other time (optimization)
		if (event.count%2 == 0)
			ship.draw();
	}
}

//function called on key press
function onKeyDown(event) {
	// Open menu
	if (event.key == "escape")
		console.log(event.key + " pressed");
	// Prevent the arrow keys from scrolling the window:
	return !(/left|right|up|down/.test(event.key));
}

/*
 * Processing Interactions
 */
function interact(obj1, obj2){
	//Check collisions
	if (obj1.path.intersects(obj2.path)){
		// TODO: Add case statements for different types of objects
		console.log(obj1.type);
		console.log(obj2.type);
		GAME.pause();
	}

	//Compute gravitation
	var starPull	= 50 //TODO: fix
	var starCenter 	= obj1.center;
	var shipCenter  = obj2.center;
	var gravityVector 	= new Point({
		x: (shipCenter.x - starCenter.x),
		y: (shipCenter.y - starCenter.y)
	});
	gravityVector.length = ((star.mass*starPull)/Math.pow((gravityVector.length+.0001), 2)); //Smoothing to not div by 0
	gravityVector.angle += 180; //Invert the angle
	positionVector += gravityVector; //How should this be computed? hmmmmmmm
}


function interactions(){
	var objects = GAME.objects.toArray();
	for (var i=1; i<object.length; i++){
		for (var j=0; j<i; j++){
			interact(objects[i],objects[j]);
		}
	}
}


/*
 * Object Factories/Functions
 */
var ship;
project.importSVG('models/ship.svg', function(shipSvg){
	var shipCount = 0;
	var shipMass = 10;
	shipSvg.scale(.3);
	shipSvg.rotation = 90;
	ship = createShip(shipSvg);
	// var shipString = shipSvg.exportSVG({asString:true});
	// console.log(shipString);
	var key = "ship"+shipCount;
	GAME.objects[key] =
		{
		key 	: key,
		type 	: "ship",
		path 	: ship,
		center 	: function(){return this.path.position},
		mass 	: shipMass
		}
	shipCount++;
});


var stars = [];
var starCount = 0;
function createStar(radius, mass, center){
	//Add visually
	//TODO: Make color correlate to massiveness
	var star = new Path.Circle({
		center: center,
		radius: radius,
		strokeWidth: 2.5,
		fillColor: 'white',
		strokeColor: 'yellow'
	});
	//Add to data structure
	var key = "star"+starCount;
	// GAME.objects[key] =
	stars.push(
		{
		key 	: key,
		type 	: "star",
		path 	: star,
		center 	: center,
		mass 	: mass
		}
	);
	starCount++;
}

function createShip(shipSvg) {
	return new function() {
		// Ship Constants
		var steering = 5;

		// Spawn Setup
		var spawnPoint = new Point({
			x: (view.viewSize.width * .85),
			y: (view.viewSize.height * .5)
		});
		var spawnAngle = 90;

		var body = new PlacedSymbol(shipSvg);
		body.position = spawnPoint;
		body.rotation = spawnAngle;


		// Positional Vectors
		var positionVector = new Point({
			angle: spawnAngle,
			length: 2
		});

		var thrustVector = new Point({
			angle: 0,
			length: .08
		});

		// Ship Methods
		return {
			left: function() {
				body.rotate(-steering);
			},

			right: function() {
				body.rotate(steering);
			},

			thrust: function() {
			    thrustVector.angle = body.rotation;
			    positionVector += thrustVector;
			},

			draw: function() {
				body.position += positionVector;
				this.pacman();
			},

			pacman: function() {
				var bounds = body.bounds;
				var position = body.position;
				var size = view.size;
				if (!bounds.intersects(view.bounds)) {
					if (position.x < -bounds.width)
						position.x = size.width + bounds.width;
					if (position.y < -bounds.height)
						position.y = size.height + bounds.height;
					if (position.x > size.width + bounds.width)
						position.x = -bounds.width;
					if (position.y > size.height + bounds.height)
						position.y = -bounds.height;
				}
			},

			starInteractions: function() {
				stars.forEach(function(star){
					//Check collisions
					if (body.intersects(star.path)){
						GAME.pause();
					}

					//Compute gravitation
					var starPull	= 50 //TODO: fix
					var starCenter 	= star.center;
					var shipCenter  = body.position;
					var gravityVector 	= new Point({
						x: (shipCenter.x - starCenter.x),
						y: (shipCenter.y - starCenter.y)
					});
					gravityVector.length = ((star.mass*starPull)/Math.pow((gravityVector.length+.0001), 2)); //Smoothing to not div by 0
					gravityVector.angle += 180; //Invert the angle
					positionVector += gravityVector;
				});
			}

		}
	};
}


/*
 * Game Setup (Object Creation in-game)
 */
//Create the center start 
createStar(60,60,view.center);
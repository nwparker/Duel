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
var html_canvas = document.getElementById("canvas-4");
var raster = new Raster(html_canvas);
console.log(raster);
console.log("testttt");
raster.onLoad = function() {
    console.log('The canvas has loaded.');
};


//Game Variables
var GAME = {
	paused 	: false,
	pause 	: function(){this.paused = true;},
	unpause : function(){this.paused = false;},
	objects	: {},
	type 	: {
				SHIP 	: "ship",
				STAR 	: "star",
				PLASMA 	: "plasma"
			  }
};

//function called on each iteration
function onFrame(event) {
	if (typeof ship !== 'undefined' && !GAME.paused){
		//Loop over objects
		proccessInteractions();

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

function checkCollisions(objA,objB){
    var checkSingle = function(objX, objY, isGameOver){
       	if (objX.getPath().intersects(objY.getPath())){
           	if (objX.type === GAME.type.SHIP){
               	isGameOver = true;
               	if (objY.type === GAME.type.SHIP){
                   //deduct pts
               	}
               	else if (objY.type === GAME.type.STAR){
                   //deduct pts
               	}
               	else if (objY.type === GAME.type.PLASMA){
                   //deduct pts
               	}
               	//Remove the ship
               	objX.remove();
           	}
           	else if (objX.type === GAME.type.STAR){
               	if (objY.type === GAME.type.STAR){
            		console.log("Suns collided");
               	}
               	else if (objY.type === GAME.type.PLASMA){
               		// Remove the plasma
               }
           	}
           	else if (objX.type === GAME.type.PLASMA){
               	if (objY.type === GAME.type.PLASMA){
					// Remove BOTH plasma
               	}
           	}
    	}
    	return isGameOver;
    }
    // Pause if ship(s) destoryed
    if( checkSingle(objB, objA, checkSingle(objA, objB, false)) )
        GAME.pause();
}

/*
 * Processing Interactions
 */
function gravity(effected, attractor){
	 var GRAV_CONST      = 10 //TODO: playWith
	 var effectedCenter  = effected.getCenter();
	 var attractorCenter = attractor.getCenter();
	 var gravityVector   = new Point({
	     x: (effectedCenter.x - attractorCenter.x),
	     y: (effectedCenter.y - attractorCenter.y)
	 });
	 gravityVector.length = GRAV_CONST*((effected.mass*attractor.mass)/((gravityVector.length*gravityVector.length)+.0001));//Smoothed
	 gravityVector.angle += 180; //Invert the angle
	 effected.object.setPositionVector(effected.object.getPositionVector() + gravityVector); //Apply force
}

function interact(obj1, obj2){
	// Apply Newton's Universal Law of Gravity (Don't effect stars)
	if (obj1.type === GAME.type.STAR && obj2.type !== GAME.type.STAR){
		gravity(obj2, obj1);
	}else if (obj1.type !== GAME.type.STAR && obj2.type === GAME.type.STAR){
		gravity(obj1, obj2);
	}
}

function proccessInteractions(){
	//Dictonary to Array
    var objects = [];
    for (var key in GAME.objects) {
      if (GAME.objects.hasOwnProperty(key)) {
        objects.push(GAME.objects[key]);
      }
    }

	for (var i=1; i<objects.length; i++){
		for (var j=0; j<i; j++){
			checkCollisions(objects[i],objects[j]);
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
		key 				: key,
		type 				: GAME.type.SHIP,
		object 				: ship,
		remove 				: function(){this.getPath().remove();
										 delete GAME.objects[this.key];},
		getPath 			: function(){return this.object.getPath();},
		getPositionVector 	: function(){return this.object.getPositionVector();},
		getCenter 			: function(){return this.getPath().position;},
		mass 				: shipMass
		}
	shipCount++;
});


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
	GAME.objects[key] = {
		key 				: key,
		type 				: GAME.type.STAR,
		object 				: star,
		remove 				: function(){/*Do Nothing*/},
		getPath 			: function(){return this.object;},
		getPositionVector	: function(){return null;},
		getCenter 			: function(){return center;},
		mass 				: mass}
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

		//ToDo: Fix the thrust
		/*
		var thrust = new Path({
		    segments: [[-7.1, -3], [-50, 0], [-7.1, 3]],
		    fillColor: 'white',
		    visible : true
		});
		var shipGroup = new Group(body, thrust);
		*/
		
		var path = new Path({
		    strokeColor	: 'white',
		    dashArray 	: [1, 10]
		});

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
			getPath : function() {
				return body;
			},

			getPositionVector : function() {
				return positionVector;
			},

			setPositionVector : function(newVector) {
				positionVector = newVector;
			},

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
			    // Draw trail
			    var path = new Path.Circle({
			        center: body.position,
			        radius: 1,
			        fillColor: 'white',
			        strokeWidth: 0,
			    });
			    // Update Ship Position
			    body.position += positionVector;
			    // Bound Object
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
			}

		}
	};
}


/*
 * Game Setup (Object Creation in-game)
 */
//Create the center start 
createStar(60,60,view.center);
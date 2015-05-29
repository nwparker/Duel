//This code is born from the 'sperm' code on http://paperjs.org/features/
/*
 * Set Styles
 */
project.currentStyle = {
	strokeColor: 'black',
	strokeWidth: 4,
	strokeCap: 'round'
};

// Game Variables
var GAME = {
	paused 	: false,
	pause 	: function(){this.paused = true;},
	unpause : function(){this.paused = false;},
	objects	: {}
}

var ship;
project.importSVG('models/ship.svg', function(shipSvg){
	var curKey = 0;
	var shipMass = 10;
	shipSvg.scale(.3);
	shipSvg.rotation = 90;
	ship = createShip(shipSvg);
	// var shipString = shipSvg.exportSVG({asString:true});
	// console.log(shipString);
	GAME.objects[("ship"+curKey)] =
		{
		type 	: "ship",
		path 	: ship,
		center 	: function(){return this.path.position},
		mass 	: shipMass
		}
	curKey++;
});


var stars = [];
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
	// GAME.objects.push(
	stars.push(
		{
		type 	: "star",
		path 	: star,
		center 	: center,
		mass 	: mass
		}
	);
}
//Create the center start 
createStar(60,60,view.center);

//This code is what gets called on each iteration
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

function onKeyDown(event) {
	// Open menu
	if (event.key == "escape")
		console.log(event.key + " pressed");
	// Prevent the arrow keys from scrolling the window:
	return !(/left|right|up|down/.test(event.key));
}


function createShip(shipSvg) {
	return new function() {
		var spawnPoint = new Point({
			x: (view.viewSize.width * .85),
			y: (view.viewSize.height * .5)
		});
		var spawnAngle = 90;

		// // TODO: Change into a ship shape
		// var bodyPath = new Path.Oval({
		// 	from: [0, 0],
		// 	to: [13, 8],
		// 	fillColor: 'blue',
		// 	strokeColor: null
		// });
		// bodyPath.scale(1.3);
		// var bodySymbol = new Symbol(shipSvg);
		var body = new PlacedSymbol(shipSvg);
		body.position = spawnPoint;
		body.rotation = spawnAngle;


		/*
		 * Ship constants
		 */
		var steering = 5;

		/*
		 * Vectors for position
		 */
		var positionVector = new Point({
			angle: spawnAngle,
			length: 2
		});

		var thrustVector = new Point({
			angle: 0,
			length: .08
		});

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

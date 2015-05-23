//This code is born from the 'sperm' code on http://paperjs.org/features/
/*
 * Set Styles
 */
project.currentStyle = {
	strokeColor: 'black',
	strokeWidth: 4,
	strokeCap: 'round'
};


//Create the sun
var sun = new Path.Circle({
	center: view.center,
	radius: 60,
	strokeWidth: 2.5,
	fillColor: 'white',
	strokeColor: 'yellow'
});

// add all suns to this array
var suns = [sun];


//This code is what gets called on each iteration
function onFrame() {
	if (Key.isDown('up')){
		ship.thurst();
		ship.draw();
		return;
	}

	if (Key.isDown('left'))
	    ship.left();

	if (Key.isDown('right'))
		ship.right();


	ship.draw();
}

function onKeyDown(event) {
	// Open menu
	if (event.key == "escape")
		console.log(event.key + " pressed");
	// Prevent the arrow keys from scrolling the window:
	return !(/left|right|up|down/.test(event.key));
}



var ship = new function() {
	var spawnPoint = new Point({
		x: (view.viewSize.width * .85),
		y: (view.viewSize.height * .5)
	});
	var spawnAngle = 90;

	// TODO: Change into a ship shape
	var headPath = new Path.Oval({
		from: [0, 0],
		to: [13, 8],
		fillColor: 'blue',
		strokeColor: null
	});
	headPath.scale(1.3);
	var headSymbol = new Symbol(headPath);
	var head = new PlacedSymbol(headSymbol);
	head.position = spawnPoint;
	head.rotation = spawnAngle;


	/*
	 * Ship constants
	 */
	var steering = 5;

	/*
	 * Vectors for position
	 */
	var positionVector = new Point({
		angle: spawnAngle,
		length: .5
	});

	var thrustVector = new Point({
		angle: 0,
		length: .05
	});

	return {
		left: function() {
			head.rotate(-steering);
		},

		right: function() {
			head.rotate(steering);
		},

		thrust: function() {
		    thrustVector.angle = head.rotation;
		    positionVector += thrustVector;
		},

		draw: function() {
			head.position += positionVector;
			this.pacman();
		},

		pacman: function() {
			var bounds = head.bounds;
			var position = head.position;
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
/*
 * Set Styles
 */
project.currentStyle = {
	strokeColor: 'black',
	strokeWidth: 4,
	strokeCap: 'round'
};
//This code is born from the 'sperm' code on http://paperjs.org/features/

//This code is what gets called on each iteration
function onFrame() {
	if (Key.isDown('left'))
	    ship.left();

	if (Key.isDown('right'))
		ship.right();

	if (Key.isDown('up'))
		ship.forward();

	ship.draw();
}

function onKeyDown(event) {
	// Open menu
	if (event.key == "escape")
		console.log(event.key + " pressed");
	// Prevent the arrow keys from scrolling the window:
	return !(/left|right|up|down/.test(event.key));
}

//Create the sun
var sun = new Path.Circle({
	center: view.center,
	radius: 60,
	strokeWidth: 2.5,
	fillColor: 'white',
	strokeColor: 'yellow'
});


var ship = new function() {
	var center = view.center; //TODO: change to spawn point
	// var size = 5;
	// var partLength = 2;
	// var path = new Path();
	// for (var i = 0; i < size; i++) {
	// 	path.add(center - [i * partLength, 0]);
	// }
	// path.strokeColor = 'orange';

	var headPath = new Path.Oval({
		from: [0, 0],
		to: [13, 8],
		fillColor: 'blue',
		strokeColor: null
	});
	headPath.scale(1.3);

	var headSymbol = new Symbol(headPath);
	var head = new PlacedSymbol(headSymbol);

	var vector = new Point({
		angle: 0,
		length: 2
	});

	/*
	 * Ship constants
	 */
	var speed = 1;
	var maxSteer = 4.5;
	var friction = 0.98;
	var steering = 1.5;
	var maxSpeed = 10;
	var minSpeed = 1;
	var position = center;
	var lastRotation = 0;
	var count = 0;

	return {
		left: function() {
			vector.angle -= steering;
			// speed *= friction;
		},

		right: function() {
			vector.angle += 	steering;
			// speed *= friction;
		},

		forward: function() {
			speed += 0.3;
			speed = Math.min(maxSpeed, speed);
		},

		draw: function() {
			var vec = vector.normalize(Math.abs(speed));
			position += vec;
			// speed *= friction;
			// var lastPoint = path.firstSegment.point = position;
			// var segments = path.segments;
			// var lastVector = vec;
			// for (var i = 1, l = segments.length; i < l; i++) {
			// 	var segment = segments[i];
			// 	var vector2 = lastPoint - segment.point;
			// 	count += vec.length * 10;
			// 	var rotLength = Math.sin((count + i * 3) / 600);
			// 	var rotated = lastVector.rotate(90).normalize(rotLength);
			// 	lastPoint = segment.point = lastPoint + lastVector.normalize(-partLength - vec.length / 10);
			// 	segment.point += rotated;

			// 	if (i == 1) {
			// 		head.position = position;
			// 		var rotation = vector2.angle;
			// 		head.rotate(rotation - lastRotation);
			// 		lastRotation = rotation;
			// 	}
			// 	lastVector = vector2;
			// }
			// path.smooth();
			head.position = position;
			// var rotation = vector2.angle;
			head.rotate(vector.angle);
			// lastRotation = rotation;
			this.pacman();
		},

		pacman: function() {
			var bounds = head.bounds;
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
				head.position = position;
			}
		}
	}
};
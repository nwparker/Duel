var ship_svg_string = '<?xml version="1.0" encoding="UTF-8" standalone="no"?> \
<svg \
   xmlns:dc="http://purl.org/dc/elements/1.1/" \
   xmlns:cc="http://creativecommons.org/ns#" \
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" \
   xmlns:svg="http://www.w3.org/2000/svg" \
   xmlns="http://www.w3.org/2000/svg" \
   version="1.1" \
   id="svg2" \
   viewBox="0 0 744.09448819 1052.3622047" \
   height="297mm" \
   width="210mm"> \
  <defs \
     id="defs4" /> \
  <metadata \
     id="metadata7"> \
    <rdf:RDF> \
      <cc:Work \
         rdf:about=""> \
        <dc:format>image/svg+xml</dc:format> \
        <dc:type \
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> \
        <dc:title></dc:title> \
      </cc:Work> \
    </rdf:RDF> \
  </metadata> \
  <g \
     id="layer1"> \
    <path \
       id="path4233" \
       d="M 351.39453 522.92969 L 352.08594 614.83008 L 322.13086 615.00781 L 321.78516 588.30469 L 292.59375 588.48242 L 293.11133 661.57422 L 322.05469 661.03906 L 321.92773 648.68359 L 331.39258 644.76953 C 339.2884 650.37655 349.19238 675.57936 369.18359 678.85352 L 369.18359 679.01953 C 369.35837 678.998 369.52594 678.9604 369.69922 678.93555 C 369.87313 678.96051 370.04137 678.99792 370.2168 679.01953 L 370.2168 678.85352 C 390.20801 675.57936 400.11199 650.37655 408.00781 644.76953 L 417.47266 648.68359 L 417.3457 661.03906 L 446.28906 661.57422 L 446.80859 588.48242 L 417.61523 588.30469 L 417.26953 615.00781 L 387.31445 614.83008 L 388.00586 522.92969 L 369.95508 522.92969 L 369.44531 522.92969 L 351.39453 522.92969 z " \
       style="fill:#ffd42a;fill-rule:evenodd;stroke:none;stroke-width:0.98434889px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" /> \
  </g> \
</svg>';


paper.install(window);
var trail_raster;
var trail_color;
window.onload = function() {
    // Setup directly from canvas id:
    paper.setup('space_canvas');
    var tool = new Tool();

    /*
     * Set Styles
     */
    project.currentStyle = {
        strokeColor: 'black',
        strokeWidth: 4,
        strokeCap: 'round'
    };

    // Canvas setup
    var background_canvas = document.getElementById("trail_canvas").getContext('2d');
    var white_pixel = background_canvas.createImageData(1,1);
    white_pixel.data[0]   = 255;
    white_pixel.data[1]   = 255;
    white_pixel.data[2]   = 255;
    white_pixel.data[3]   = 255;

    function draw_trail(position) {
        background_canvas.putImageData(white_pixel, position.x, position.y);
    }

    /*
     * Set up game variables and other tasks
     */

    //Game Variables
    var GAME = {
        paused  : false,
        pause   : function(){this.paused = true;},
        unpause : function(){this.paused = false;},
        objects : {},
        type    : {
                    SHIP    : "ship",
                    STAR    : "star",
                    PLASMA  : "plasma"
                  }
    };

    //function called on each iteration
    view.onFrame = function(event) {
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
                ship.draw(event.count);
        }
    }

    //function called on key press
    tool.onKeyDown = function(event) {
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
         effected.object.setPositionVector(effected.object.getPositionVector().add(gravityVector)); //Apply force
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
            key                 : key,
            type                : GAME.type.STAR,
            object              : star,
            remove              : function(){/*Do Nothing*/},
            getPath             : function(){return this.object;},
            getPositionVector   : function(){return null;},
            getCenter           : function(){return center;},
            mass                : mass}
        starCount++;
    }


    /*
     * Object Factories/Functions
     */
    var shipSvg = project.importSVG(ship_svg_string);
    shipSvg.scale(.3);
    shipSvg.rotation = 90;
    var shipMass = 10;
    var ship_steering = 5;
    var ship = createShip(shipSvg);
    // var shipString = shipSvg.exportSVG({asString:true});
    // console.log(shipString);
    var shipCount = 0;
    var key = "ship"+shipCount;
    GAME.objects[key] =
        {
        key                 : key,
        type                : GAME.type.SHIP,
        object              : ship,
        remove              : function(){this.getPath().remove();
                                         delete GAME.objects[this.key];},
        getPath             : function(){return this.object.getPath();},
        getPositionVector   : function(){return this.object.getPositionVector();},
        getCenter           : function(){return this.getPath().position;},
        mass                : shipMass
        }
    shipCount++;

    function createShip(shipSvg) {
        return new function() {
            // Ship Constants

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
                strokeColor : 'white',
                dashArray   : [1, 10]
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
                    body.rotate(-ship_steering);
                },

                right: function() {
                    body.rotate(ship_steering);
                },

                thrust: function() {
                    thrustVector.angle = body.rotation;
                    positionVector = positionVector.add(thrustVector);
                },

                draw: function(frame_count) {
                    // Draw trail
                    draw_trail(body.position);

                    // Update Ship Position
                    body.position = body.position.add(positionVector);
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
}
var container, stats;
var camera, controls, scene, renderer, controller, leapControls;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var controlType = 'mouse';
var runFrames = false;
var assembled = true;
var assembledBeforeFlyTo = false;

var cameraHomePosition = [10,5,10]; 

var conLength = 12.2;
var zOffset = -(conLength/2);

var trackNumber = 0;
var noOfTracks = 1000;


var firstrun = 1;

var showDetailsStatus = false;

init();


function init() {
    
    // scene
    
    renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
    
	scene = new THREE.Scene();
    
    //offsets for info panels
    scene.position.z = 2.5;
    scene.position.y = 1;
    
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
    
    light1 = new THREE.DirectionalLight( 0xFFFFFF, 2.0 );
	light1.position.set( 10000, 10000, 10000 );

	scene.add( light1 );

	light2 = new THREE.DirectionalLight( 0xFFFFFF );
	light2.position.set( -10000, -10000, -1000 );
	scene.add( light2 );

	light3 = new THREE.AmbientLight( 0x222222 );
	scene.add( light3 );
    
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / (window.innerHeight), 1, 1000 );
    camera.position.x = cameraHomePosition[0];
    camera.position.y = cameraHomePosition[1];
    camera.position.z = cameraHomePosition[2];
    
   // effect = new THREE.StereoEffect(renderer);
    //effect.setSize( window.innerWidth, window.innerHeight );
     
     var effect = new THREE.VREffect(renderer);
     
     controls = new THREE.OrbitControls( camera );
    			  
    				
    controls = new DeviceOrientationController( camera, renderer.domElement );
   controls.connect();

  //controls.damping = 0.2;
    				controls.addEventListener( 'change', render );

	// model
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
            out( Math.round(percentComplete, 2) + '% downloaded' );
            render();
		}
	};

	var onError = function ( xhr ) {
	};

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    
    // Generate the neighbouring conveyors
    var loaderOBJ = new THREE.OBJLoader();
    
    // Generate the conveyor line structure
    
    var loaderOBJMTL = new THREE.OBJMTLLoader();

    loaderOBJMTL.load( 'obj/Conveyor_Structure.obj', 'obj/Conveyor_Structure.mtl', function ( object ) {

        var structureMaster = object;
        scene.add( structureMaster ); // This is the one we'll make the master
        structureClone = [];
        for(i=1;i<=1000;i++) { 
            structureClone[i] = object.clone();
            structureClone[i].position.z = zOffset*i;
            if( structureClone[i].material ) {
                structureClone[i].material.opacity = 0.5;
                structureClone[i].material.transparent = true;
            }
            scene.add( structureClone[i] );
        }
    }, onProgress, onError );
    
    out('Structure Created');
    
    loaderOBJMTL.load( 'obj/Conveyor_Belt.obj', 'obj/Conveyor_Belt.mtl', function ( object ) {
        beltFocus = object.clone();
        beltFocus.name = "beltFocus";
        scene.add( beltFocus ); 
    }, onProgress, onError );
    
    out('Conveyor Created');
    loaderOBJMTL.load( 'obj/Conveyor_Rollers.obj', 'obj/Conveyor_Rollers.mtl', function ( object ) {
        rollersFocus = object.clone();
        scene.add( rollersFocus ); // This is the one we'll make the master
    }, onProgress, onError );
    
    out('Rollers Created');
    
    
    // Create ID Text
  /////// Draw ID on ground /////////

      loaderOBJMTL.load( 'obj/CVID.obj', 'obj/CVID.mtl', function ( object ) {
        scene.add( object );
        object.rotation.y = Math.PI;
        object.position.y = 0.0;
    }, onProgress, onError );


    //Environment
    
    de2ra = function(degree)   { return degree*(Math.PI/180); }
    
     loaderOBJMTL.load( 'obj/Environment_Ground.obj', 'obj/Environment_Ground.mtl', function ( object ) {
        scene.add( object );
    }, onProgress, onError );
    
     loaderOBJMTL.load( 'obj/Environment_Road.obj', 'obj/Environment_Road.mtl', function ( object ) {
        scene.add( object );
    }, onProgress, onError );
    
     loaderOBJMTL.load( 'obj/Environment_Dome.obj', 'obj/Environment_Dome.mtl', function ( object ) {
        scene.add( object );
    }, onProgress, onError );
    
     loaderOBJMTL.load( 'obj/Environment_Stockpiles.obj', 'obj/Environment_Stockpiles.mtl', function ( object ) {
        object.position.x = -5;
         object.rotation.y = de2ra(90);
         scene.add( object );
         spClone = [];
        for(i=1;i<=20;i++) { 
            spClone[i] = object.clone();
            spClone[i].position.z = zOffset*i*50;
            if( spClone[i].material ) {
                spClone[i].material.opacity = 0.5;
                spClone[i].material.transparent = true;
            }
            scene.add( spClone[i] );
        }
    }, onProgress, onError );
    
    loaderOBJMTL.load( 'obj/Conveyor_Roller_Isolated.obj', 'obj/Conveyor_Roller_Isolated.mtl', function ( object ) {
        isolatedRoller = object.clone();
        
        isolatedRoller.children[0].material.color.setHex( 0xffffff );
        isolatedRoller.children[1].material.color.setHex( 0xffffff );
        isolatedRoller.children[2].material.color.setHex( 0xffffff );
        isolatedRoller.children[3].material.color.setHex( 0xffffff );
    }, onProgress, onError );

    
    out('Environment Created');
 
    
    //renderer = new THREE.WebGLRenderer();
    //renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, (window.innerHeight) );
   // renderer.setClearColor( 0x2f4f4f, 1);

	container.appendChild( renderer.domElement );


	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    
   // container.appendChild( renderer.domElement );
  
    window.addEventListener( 'resize', onWindowResize, false );
    
    
    animate();
	
   
}



///// FLY TO FUNCTIONS ////

//stage 1
function initFlyTo(trackNumber) {
    if(!assembled) {
        assembleConveyor();
        assembledBeforeFlyTo = true;
    }
    out('initiating flyto - buckle up');
    $('.report').fadeOut(2000);
    var tween = new TWEEN.Tween( { x: camera.position.x, y: camera.position.y, z: camera.position.z } )
        .to( { x: cameraHomePosition[0], y: cameraHomePosition[1], z:cameraHomePosition[2] }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        } )
        .start()
        .onComplete(function(){
            runFrames = false;
            out('flyto init complete, starting fly down track...');
            // Put stage 2 in here
            if(trackNumber>=0) {
                trackFlyTo(trackNumber);
            }
        });
}

//stage 2
function trackFlyTo(trackNumber) {
    out('flying down track');
    //vectorZ = 1-(cameraHomePosition[2]/cameraHomePosition[0]);
    //vectorY = 1-(cameraHomePosition[1]/cameraHomePosition[0]);
    //vectorZ = -1;
    //var vector = new THREE.Vector3( 0, 0, -1 );
    
    // create a temp for belt and rollers, place it where the one is now, then move the focus ones to the new location
    beltTemp = beltFocus.clone();
    scene.add( beltTemp );
    beltFocus.position.set(0,0, -conLength*trackNumber);
    
    rollersTemp = rollersFocus.clone();
    scene.add( rollersTemp );
    rollersFocus.position.set(0,0, -conLength*trackNumber);
    
    
    var tween = new TWEEN.Tween( { x: scene.position.x, y: scene.position.y, z: scene.position.z } )
        .to( { x: scene.position.x, y: scene.position.y, z: scene.position.y+(conLength*trackNumber) }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            scene.position.x = this.x;
            scene.position.y = this.y;
            scene.position.z = this.z;
            //scene.lookAt(vectorX, vectorY, vectorZ);
        } )
        .start()
        .onComplete(function(){
            runFrames = false;
            out('flyto complete');
            // Put stage 3 in here
            
            // remove temps
            scene.remove(rollersTemp);
            scene.remove(beltTemp);
            render();
            
            // stage 3
            
            finishFlyTo();
        });
}

function finishFlyTo() {
   $('.report').fadeIn(2000);
    if (assembledBeforeFlyTo) {
        inspectConveyor();
        assembledBeforeFlyTo = false;
    }
    var tween = new TWEEN.Tween( { x: camera.position.x, y: camera.position.y, z: camera.position.z } )
        .to( { x: cameraHomePosition[0]+1, y: cameraHomePosition[1]+1, z:cameraHomePosition[2]-6 }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        } )
        .start()
        .onComplete(function(){
            runFrames = false;
            out('flyto init complete, starting fly down track...');
            // Put stage 2 in here
            
        });
}

function zoomOut() {
 
    var tween = new TWEEN.Tween( { x: camera.position.x, y: camera.position.y, z: camera.position.z } )
        .to( { x: camera.position.x+10, y: camera.position.y+10, z:camera.position.z+10, }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        } )
        .start()
        .onComplete(function(){
            runFrames = false;
        });
}

function zoomIn() {
 
    var tween = new TWEEN.Tween( { x: camera.position.x, y: camera.position.y, z: camera.position.z } )
        .to( { x: camera.position.x-10, y: camera.position.y-10, z:camera.position.z-10, }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        } )
        .start()
        .onComplete(function(){
            runFrames = false;
        });
}


///////  Inspection animation functions //////
function inspectConveyor() {
    raiseBelt();
    raiseRollers();
    assembled = false;
    hideDetails();
}

function assembleConveyor() {
    assembleBelt();
    assembleRollers();
    assembled = true;
    hideDetails();
}

function raiseBelt() {
    
    //beltFocus = scene.getObjectByName( "beltFocus" );
    
    var tween = new TWEEN.Tween( { x: 0, y: 0 } )
        .to( { x: 0, y: 3 }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            beltFocus.position.y = this.y;
        } )
        .start()
        .onComplete(function(){
           
            runFrames = false
        });
}

function raiseRollers() {
    
    console.log('we got this far');
    
    //rollersFocus = scene.getObjectByName( "rollersFocus" );
    
    console.log(rollersFocus);
    
    var tween = new TWEEN.Tween( { x: 0, y: 0 } )
        .to( { x: 0, y: 1.5 }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            rollersFocus.position.y = this.y;
        } )
        .start()
        .onComplete(function(){runFrames = false});
}

 function assembleBelt() {
    
    console.log('we got this far');
    
    //beltFocus = scene.getObjectByName( "beltFocus" );
    
    //console.log(beltFocus);
    
    var tween = new TWEEN.Tween( { x: 0, y: 3 } )
        .to( { x: 0, y: 0 }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            beltFocus.position.y = this.y;
        } )
        .start()
        .onComplete(function(){
            runFrames = false
        });
}

function assembleRollers() {
    
    //console.log('we got this far');
    
    //rollersFocus = scene.getObjectByName( "rollersFocus" );
    
    //console.log(rollersFocus);
    
    var tween = new TWEEN.Tween( { x: 0, y: 1.5 } )
        .to( { x: 0, y: 0 }, 2000 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function () {
            runFrames = true;
            rollersFocus.position.y = this.y;
        } )
        .start()
        .onComplete(function(){runFrames = false});
}

function showDetails() {
    hideDetails();
    isolatedRoller.position.y = rollersFocus.position.y;
    isolatedRoller.position.z = rollersFocus.position.z;
    scene.add( isolatedRoller );
    $('#details-panel').fadeIn(500);
    showDetailsStatus = true;
    render();
}

function hideDetails() {
    scene.remove( isolatedRoller );
    $('#details-panel').fadeOut(200);
    showDetailsStatus = false;
    render();
}


///////////////////////////////////////////////


function onWindowResize() {

	camera.aspect = window.innerWidth / (window.innerHeight-200);
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, (window.innerHeight-200) );

	render();

}

function onDocumentMouseMove( event ) {
    if(controlType == 'mouse') {
	    mouseX = ( event.clientX - windowHalfX ) / 2;
	    mouseY = ( event.clientY - windowHalfY ) / 2;
    }
}

//

function animate() {

	requestAnimationFrame( animate );
    
    if(runFrames) {
        render();
    }
    
    TWEEN.update();
    
    
    controls.update();
    
  
}

function render() {
    
    //if(!vr) {
	   // renderer.render( scene, camera );
    //} else {
        manager.render( scene, camera );
    //}

}

  function out (data) {
                $('#console-output').append( data+'<br>' );
            }
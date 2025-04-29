<html lang="en"><head>
		<title>Convatech Demo</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<style>
			body {
        position: relative;
        font-family: "proxima-nova", 'Helvetica Neue', 'Helvetica', 'sans-serif';
        color: #232830;
				color: #fff;
				margin: 0px;
				overflow: hidden;
			}
			#info {
				color: #fff;
				position: absolute;
				top: 10px;
				width: 100%;
				text-align: center;
				z-index: 100;
				display:block;
			}
			#info a, .button { color: #f00; font-weight: bold; text-decoration: underline; cursor: pointer }
		</style>
	</head>
    
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    
	<body>
		<div id="info">
		Convatech Demo
		</div>

    <script src="build/three.min.js"></script>
    <script src="leap/lib/leap.min.js"></script>
    <script src="leap/controls/LeapSpringControls.js"></script>
    <script src="js/loaders/DDSLoader.js"></script>
    <script src="js/loaders/MTLLoader.js"></script>
    <script src="js/loaders/OBJMTLLoader.js"></script>
    <script src="js/loaders/OBJLoader.js"></script>
    <script src="js/Detector.js"></script>
    <script src="js/libs/stats.min.js"></script>
    <script src="js/controls/OrbitControls.js"></script>
    <script src="js/shaders/CopyShader.js"></script>
    <script src="js/shaders/DotScreenShader.js"></script>
    <script src="js/shaders/RGBShiftShader.js"></script>
    <script type='text/javascript' src='js/tween.js'></script>
    <script src="js/renderers/Projector.js"></script>
    <script src="js/renderers/CanvasRenderer.js"></script>

    <script src="Chart.js/Chart.js"></script>
        
        <!---
		<script src="js/postprocessing/EffectComposer.js"></script>
		<script src="js/postprocessing/RenderPass.js"></script>
		<script src="js/postprocessing/MaskPass.js"></script>
		<script src="js/postprocessing/ShaderPass.js"></script>
        --->

        <script src="https://code.jquery.com/jquery.js"></script>
        <script src="https://code.jquery.com/ui/jquery-ui-git.js"></script>
        
        <script>
            
            function getUrlParameter(sParam)
            {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) 
                {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] == sParam) 
                    {
                        return sParameterName[1];
                    }
                }
            }      
            
            var voice = 0;
            voice = getUrlParameter('voice');
            
            if(voice) {
                var thimblrSpeech = document.createElement('script');
                thimblrSpeech.src = "http://semanticsai.com/old/engine_1.js?"+Math.random();
                document.getElementsByTagName('head')[0].appendChild(thimblrSpeech);
            }
            
            
            $(function() {
                $( ".draggable" ).draggable();
            });
            
            function out (data) {
                $('#console-output').append( data+'<br>' );
            }
            
            $(document).ready(function() {
                $("input[name='controlType']").change(function() {
                    controlType = $("input[name='controlType']:checked").val();
                    console.log(controlType);
                });
                
                $("input[name='inspectConveyor']").change(function() {
                    
                    if(assembled) {
                        inspectConveyor();
                    } else {
                        assembleConveyor(); 
                    }
                    
                });
                
                var toggleState = true;
                $('#close').click(function(){
                    if(toggleState) {
                        $('.report > .inner').slideUp();
                        $('.report').fadeTo('slow',0.5);
                      } else {
                        $('.report > .inner').slideDown();
                        $('.report').fadeTo('slow',1);
                      }
                      toggleState = !toggleState;
                });
                
                

            });
            
            function  prevDetails() {
                showDetails();
                isolatedRoller.position.z += 0.60;
            }
            
            function showDetails() {
                showDetails();
                isolatedRoller.position.z -= 0.60;
            }
            
            $("body").keydown(function(e) {
              if(e.keyCode == 37) { // left
                prevDetails();
              }
              else if(e.keyCode == 39) { // right
                nextDetails();
              }
              else if(e.keyCode == 32) { // space
                showDetails();
              }
                
                
            });
            
        </script>
        
		<script>
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

      // init dimensions of conveyor section
      var conLength = 12.2;
      var zOffset = -(conLength/2);

      var trackNumber = 0;
      var noOfTracks = 1000;

      var mouse = new THREE.Vector2(), INTERSECTED;
      var raycaster;

      var firstrun = 1;

      var showDetailsStatus = false;

      init();
			//render();
            
			function init() {
                
        // scene
                
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
                
        // place lights at every 10 sections
        newLight1 = [];
        newLight2 = [];

        
//         for(i=1;i<=5;i++) { 
//                 newLight1[i] = light1.clone();
//                 newLight1[i].position.z = conLength*200*i;
//                 scene.add( newLight1[i] );
//                 newLight2[i] = light2.clone();
//                 newLight2[i].position.z = conLength*200*i;
//                 scene.add( newLight2[i] );

//         }

        // Camera
                
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / (window.innerHeight), 1, 1000 );
        camera.position.x = cameraHomePosition[0];
        camera.position.y = cameraHomePosition[1];
        camera.position.z = cameraHomePosition[2];
        camera.position.z = cameraHomePosition[2];
                
        // controls
        controls = new THREE.OrbitControls( camera );
				controls.damping = 0.5;
        controls.maxPolarAngle = Math.PI / 2.2
				controls.addEventListener( 'change', render );
                
        // Optional LEAP Controls
        /*
        controller = new Leap.Controller({});
        controller.connect();
        leapControls = new THREE.LeapTrackballControls( camera , controller );
        leapControls.rotationSpeed = 20;
				*/
                

				// model
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
                        out( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};

				THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
                
        // Generate the neighbouring conveyors
        var loaderOBJ = new THREE.OBJLoader();

        /*

        cloneObject = [];

        loaderOBJ.load( 'obj/Conveyor_Structure.obj', function ( object ) {
           object.position.z = zOffset;
           scene.add( object );
            for(i=-500;i<=500;i++) { 
                newObject[i] = object.clone();
                newObject[i].position.z = zOffset*i;
                scene.add( newObject[i] );
            }
        }, onProgress, onError );


        */
    
                
                
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
             //scene.add( isolatedRoller );
            isolatedRoller.position.z = rollersFocus.position.z;
            isolatedRoller.children[0].material.color.setHex( 0xffffff );
            isolatedRoller.children[1].material.color.setHex( 0xffffff );
            isolatedRoller.children[2].material.color.setHex( 0xffffff );
            isolatedRoller.children[3].material.color.setHex( 0xffffff );
        }, onProgress, onError );



        //isolatedRoller = scene.getObjectByName('isolatedRoller');
        //isolatedRoller.position.z = 2;//rollersFocus.position.z;


        out('Environment Created');
       /*
         loaderOBJMTL.load( 'obj/hilux/hilux.obj', 'obj/hilux/hilux.mtl', function ( object ) {

            object.position.x = -7;
             object.position.y = 0.5;
             scene.add( object );
        }, onProgress, onError ); */

       /* 
         loaderOBJMTL.load( 'obj/Conveyor_Roller_Isolated.obj', 'obj/Conveyor_Roller_Isolated.mtl', function ( object ) {
            object.position.z = 0;
             scene.add( object );
        }, onProgress, onError );

        out('Environment Created');*/

        // Indicators 

        /* loaderOBJMTL.load( 'obj/Conveyor_Exclamation.obj', 'obj/Conveyor_Exclamation.mtl', function ( object ) {
             object.position.y = 3;
             scene.add( object );
        }, onProgress, onError );*/


       /* particleMaterial = new THREE.SpriteCanvasMaterial( {

					color: 0x000000,
					program: function ( context ) {

						context.beginPath();
						context.arc( 0, 0, 0.5, 0, PI2, true );
						context.fill();

					}

				} );
                */
                
        raycaster = new THREE.Raycaster();
                
				//mouse = new THREE.Vector2();
                
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, (window.innerHeight) );
        renderer.setClearColor( 0x2f4f4f, 1);

				container.appendChild( renderer.domElement );


				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                
                
                
        container.appendChild( renderer.domElement );

        //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
//document.addEventListener( 'touchstart', onDocumentTouchStart, false );

        window.addEventListener( 'resize', onWindowResize, false );


       /* if (firstrun) {
            initFlyTo();   
            firstrun = 0;
        }*/

        animate();
				
               
			}
            
            
       function onDocumentTouchStart( event ) {
				
          event.preventDefault();

          event.clientX = event.touches[0].clientX;
          event.clientY = event.touches[0].clientY;
          onDocumentMouseDown( event );

			}	

            
      // select functions

      function onDocumentMouseDown( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
				mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

				raycaster.setFromCamera( mouse, camera );

				var intersects = raycaster.intersectObjects( scene.THREE.Object3d.beltFocus, true );

				if ( intersects.length > 0 ) {
                    
                    console.log('weve hit something!');
                    
					//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
                    
					var particle = new THREE.Sprite( particleMaterial );
					particle.position.copy( intersects[ 0 ].point );
					particle.scale.x = particle.scale.y = 16;
					scene.add( particle );

				} else {
                 
                    console.log('nuthin');
                    console.log(scene);
                        
                }

				/*
				// Parse all the faces
				for ( var i in intersects ) {

					intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

				}
				*/
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
          scene.add( isolatedRoller );
          $('#details-panel').fadeIn(500);
          showDetailsStatus = true;
          render();
      }

      function hideDetails() {
          //isolatedRoller.position.y = rollersFocus.position.y;
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
                
                if(controlType == 'mouse') {
                    controls.update();
                }
                
                if(controlType == 'leap') {
                    leapControls.update();
                }
               //console.log(assembled);
			}
            
            function render() {
                
				renderer.render( scene, camera );

			}

			

		</script><div><canvas width="1062" height="1265" style="width: 1062px; height: 1265px; "></canvas></div>
        
        <style>
            .info-pane {
              
               
                position:absolute;
               
            
                color:#090909;
              
                font-size:11px;
               
                background-color: #fff;/*rgba(255,255,255,0.8);*/
                box-shadow: 10px 10px 5px rgba(0,0,0,0.3);
                z-index:10001;
            }
            
            .report img {
                width:200px;
            }
            
            .report {
                position:fixed;
                width:250px;
                
                float:left;
                right:0px;
                /*background-color: rgba(255,255,255,0.8);*/
                top:10px;
                right:20px;
                padding:10px;
                font-size:8px;
            }
            
            .report .inner {
                height:600px;
            }   
            
            h1 {
                font-size:14px;
            }
            
            h2 {
                font-size:12px;   
            }
            
            .overview-panel {
                position:fixed;
                bottom:0px;
                width:100%;
                height:200px;
                padding:20px;
                float:left;
                
                top:auto;
            }
            
            .overview-panel > div {
                display:inline-block;
                float:left; 
                height:200px;
            }
            
            #overview i {
                float:left;
                margin-right:1px;
                display:inline-block;
                font-size:14px;
            }
            
            #shBelt:checked {
                
            }
            
            #overview-wrap {
                width:80%;
            }
            
            li { margin-bottom:10px;
            padding-right:30px;}
            
        </style>
        
        
        <!---
        <div id="console-output" class="info-pane" style="left:50px; width: 200px; height:500px;">
            <h1>Console</h1>
            
        </div>
        
        <script>
            
            //beltFocus.visible = false;
            
        </script>
        --->
        
        
        
        
        
        <div class="info-pane overview-panel">            
            <div style="width:200px;"><h1>Tools</h1>
          <!---  <h2>Control Type</h2>
            <div><input type="checkbox" id="shBelt" checked> Show Belt</div>
            <div><input type="checkbox" id="shRollers" checked> Show Rollers</div>--->
            <h2>Inspect Conveyor</h2>
            <div><input type="radio" name="inspectConveyor" value="mouse" checked="checked"> Assembled View</div>
            <div><input type="radio" name="inspectConveyor" value="leap"> Exploded View</div>
            <!---<h2>Control Type</h2>
            <div><input type="radio" name="controlType" value="mouse" checked="checked"> Mouse</div>
            <div><input type="radio" name="controlType" value="leap"> Other</div>
            <h2>Visible Items</h2>
            <div><input type="checkbox" name="visBelt" checked>Conveyor Belt</div>
            <div><input type="checkbox" name="visRollers" checked>Conveyor Rollers</div>--->
            <h2>Fly to</h2>
            <div><input style="z-index:1000;" type="text" id="trackNumber" value="30" /><button onclick="initFlyTo(document.getElementById('trackNumber').value);">Go</button></div>
            </div>
            <div id="overview-wrap">
                <h1>Overview of Sections - Click to Inspect</h1>
                <div id="overview"></div>
               
            </div>
            <div style="float:right;margin-right:10%;margin-bottom:10px;">
                <i class="fa fa-square" style="color:green"></i> Status OK&nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-square" style="color:brown"></i> Service Due&nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-square" style="color:red"></i> Reporting Error&nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-square" style="color:black"></i> Offline&nbsp;&nbsp;&nbsp;&nbsp;
                   </div>
            
            <img src="logo.gif" style="position:absolute;right:60px;bottom:150px;width:120px;">
        </div>
        
        <style>
            #details-panel {
                opacity:0.8;
                position:absolute;
                top:10px;
                width:200px;
                left:10px;
                height:450px;
                padding:20px;
               
            }
        </style>
        
        <div class="info-pane" id="details-panel">
            <img src="logo.gif" style="width:200px">
            <h1>Roller ID #987667</h1>
            Part Serial #JJBHI67576<br>
            Manufacturer: Convatech<br>
            Manufacture Date: 09/4/2005<br>
            <br><br>
            Service History:
            <ul>
                <li>23/04/2015 - Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</li>
                <li>09/02/2012 - Perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</li>
<!--                 <li>12/06/2010 - Unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</li>
                <li>05/09/2009 - Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</li>
                <li>08/03/2007 - Error sit voluptatem accusantium doloremque laudantium, totam rem aperiam. Sed ut perspiciatis unde omnis iste natus.</li> -->
            </ul>
            <br>
            
            <h2 style="color:red">&nbsp;&nbsp;&nbsp;Request Engineer Inspection</h2>
            <h2 style="color:red">&nbsp;&nbsp;&nbsp;Order Replacement</h2>
            <h2 style="color:red">&nbsp;&nbsp;&nbsp;Request Real-time Data</h2>
            
        </div>
           
       
          
        
        <script>
            
            /*
                   content = '<div>';
                    for (i=1;i<=1000;i++) {

                        icon = '<i class="fa fa-square" style="color:'+statusColours[5];+'"></i>';
                      
                        content += icon;
                    }
            
            */
            
            
            // Returns a random integer between min (included) and max (excluded)
            // Using Math.round() will give you a non-uniform distribution!
            function getRandomInt(min, max) {
              return Math.floor(Math.random() * (max - min)) + min;
            }
            
           statusColours = [];
            
             for (i=1;i<=1000;i++) {
                 if(i<=800) {
                    statusColours.push('green');
                 } else {
                     if(i<=950) {
                        statusColours.push('brown');
                     } else {
                         if(i<=990) {
                            statusColours.push('red');
                         } else {
                             if(i<=1000) {
                                statusColours.push('black');
                             }
                         }
                     }
                 }
             }
            
            content = '<div>';
            for (i=0;i<=1000;i++) {
                randomNumber = getRandomInt(0,1000);
                
                icon = '<a href="#" onclick="initFlyTo('+i+')";><i class="fa fa-square" style="color:'+statusColours[randomNumber]+'"></i>';
                /*if (i % 1000) {
                      content+='</div><div>'; 
                }*/
                content += icon;
            }
            content += '</div>';
          
            jQuery('#overview').append(content);
            
            $(function(){
              $('.fa.fa-square')[0].click()
            })
            
        </script>
        
        
        <div class="info-pane report" style="display:none">
            
            <i class="fa fa-minus-square" style="cursor:pointer;float:right;" id="close"></i>
            <h1>Section Report Data</h1>
             
            <div class="inner">
            <ul>
                <li>17/06/15 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at molestie mi, eu mollis tellus. </li>
                <li>17/06/15 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at molestie mi, eu mollis tellus. </li>
                <li>17/06/15 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at molestie mi, eu mollis tellus. </li>
            </ul>
           
            CVID6585 - Cras aliquet pellentesque ipsum eu consequat. Vivamus dictum, ligula eu faucibus vestibulum, sem orci pulvinar nisl, sit amet eleifend diam sem eget ipsum. Aenean sagittis quis diam dignissim tempus. 
            <h2>Breakdown</h2>
           <img align="center" src="chart.png">
            <br><br>
             sit amet eleifend diam sem eget ipsum. Aenean sagittis quis diam dignissim tempus. Vestibulum mauris urna, porta at augue vel, tempor commodo dolor. Donec finibus purus sed dolor congue, ut convallis elit egestas. Suspendisse potenti. 
            
            <h2>Resources</h2>
           <img align="center" src="chart2.png">
            <br>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at molestie mi, eu mollis tellus. 
            Cras aliquet pellentesque ipsum eu consequat. Vivamus dictum, ligula eu faucibus vestibulum, sem orci pulvinar nisl.
                </div>
        </div>
	

        
        
</body></html>
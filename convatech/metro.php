<html lang="en"><head>

<html lang="en">
<head>
<title>Metro</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<link href="http://thimblr.com/iconified/apple-touch-icon.png" rel="apple-touch-icon" />
<link href="http://thimblr.com/iconified/apple-touch-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />
<link href="http://thimblr.com/iconified/apple-touch-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />
<link href="http://thimblr.com/iconified/apple-touch-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />
<link href="http://thimblr.com/iconified/apple-touch-icon-180x180.png" rel="apple-touch-icon" sizes="180x180" />
<link href="http://thimblr.com/iconified/icon-hires.png" rel="icon" sizes="192x192" />
<link href="http://thimblr.com/iconified/icon-normal.png" rel="icon" sizes="128x128" />

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
	        HEARDx
		</div>

		<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r71/three.js"></script>
        <script src="leap/lib/leap.min.js"></script>
       <script src="js/controls/PointerLockControls.js"></script>
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
      
      
        <script src="js/renderers/Projector.js"></script>
		<script src="js/renderers/CanvasRenderer.js"></script>
		
        
        <script src="js/loaders/ctm/lzma.js"></script>
		<script src="js/loaders/ctm/ctm.js"></script>
		<script src="js/loaders/ctm/CTMLoader.js"></script>
        
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
                thimblrSpeech.src = "http://thimblr.com/semanticsai/engine_1.js?"+Math.random();
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
     
                /*
                for(i=1;i<=5;i++) { 
                        newLight1[i] = light1.clone();
                        newLight1[i].position.z = conLength*200*i;
                        scene.add( newLight1[i] );
                        newLight2[i] = light2.clone();
                        newLight2[i].position.z = conLength*200*i;
                        scene.add( newLight2[i] );
                      
                }*/
                
                // Camera
                
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / (window.innerHeight), 1, 10000 );
                camera.position.set(30,20,1);
                
                // controls
                controls = new THREE.OrbitControls( camera );
				controls.damping = 0.2;
				controls.addEventListener( 'change', render );
            
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
       
                 var loaderOBJMTL = new THREE.OBJMTLLoader();
                
                var loader = new THREE.CTMLoader();
            
            
				loader.load( "/z3d/metro.ctm",  function( geometry ) {

					var material1 = new THREE.MeshLambertMaterial( { color: 0xffffff } );
					var material2 = new THREE.MeshPhongMaterial( { color: 0xff4400, specular: 0x333333, shininess: 100 } );
					var material3 = new THREE.MeshPhongMaterial( { color: 0x00ff44, specular: 0x333333, shininess: 100 } );

					callbackModel( geometry, 5, material1, -200, 0, -50, 0, 0 );
					callbackModel( geometry, 2, material2,  100, 0, 125, 0, 0 );
					callbackModel( geometry, 2, material3, -100, 0, 125, 0, 0 );


				}, { useWorker: true } );
				
				function callbackModel( geometry, s, material, x, y, z, rx, ry ) {

    				var mesh = new THREE.Mesh( geometry, material );
    
    				mesh.position.set( x, y, z );
    				mesh.scale.set( s, s, s );
    				mesh.rotation.x = rx;
    				mesh.rotation.z = ry;
    
    				mesh.castShadow = true;
    				mesh.receiveShadow = true;
    
    				scene.add( mesh );
    
    			}

                
                /*
                
                loaderOBJ.load( '/z3d/master_metro2.obj', function ( object ) {
                 //loaderOBJMTL.load( '/z3d/master_metro2.obj', '/z3d/master_metro2.mtl', function ( object ) {
                    object.scale.set(0.001, 0.001, 0.001);
                    object.position.z = 300;
                     object.position.x = -450;
                    scene.add( object ); 
                }, onProgress, onError );
                
                
                de2ra = function(degree)   { return degree*(Math.PI/180); }
                
                 loaderOBJMTL.load( 'obj/Environment_Ground.obj', 'obj/Environment_Ground.mtl', function ( object ) {
                    scene.add( object );
                }, onProgress, onError );
                /*
                 loaderOBJMTL.load( 'obj/Environment_Road.obj', 'obj/Environment_Road.mtl', function ( object ) {
                    scene.add( object );
                }, onProgress, onError );
                */
                
                /*
                 loaderOBJMTL.load( 'obj/Environment_Dome.obj', 'obj/Environment_Dome.mtl', function ( object ) {
                    scene.add( object );
                }, onProgress, onError );
    
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

                    controls.update();
           
			}
            
            function render() {
                
				renderer.render( scene, camera );

			}
			
			
			

		</script><div><canvas width="1062" height="1265" style="width: 1062px; height: 165px; "></canvas></div>
        
       
        
</body></html>
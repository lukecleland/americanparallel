
        
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
		Heard - Convatech Demo
		</div>

		<script src="//viwrr.com/convatech/build/three.min.js"></script>
        <script src="//viwrr.com/convatech/leap/lib/leap.min.js"></script>
        <script src="//viwrr.com/convatech/leap/controls/LeapSpringControls.js"></script>
		<script src="//viwrr.com/convatech/js/loaders/DDSLoader.js"></script>
		<script src="//viwrr.com/convatech/js/loaders/MTLLoader.js"></script>
		<script src="//viwrr.com/convatech/js/loaders/OBJMTLLoader.js"></script>
        <script src="//viwrr.com/convatech/js/loaders/OBJLoader.js"></script>
		<script src="//viwrr.com/convatech/js/Detector.js"></script>
		<script src="//viwrr.com/convatech/js/libs/stats.min.js"></script>
        <script src="//viwrr.com/convatech/js/controls/OrbitControls.js"></script>
        <script src="//viwrr.com/convatech/js/shaders/CopyShader.js"></script>
		<script src="//viwrr.com/convatech/js/shaders/DotScreenShader.js"></script>
		<script src="//viwrr.com/convatech/js/shaders/RGBShiftShader.js"></script>
        <script type='text/javascript' src='https://viwrr.com/convatech/js/tween.js'></script>
        <script src="//viwrr.com/convatech/js/renderers/Projector.js"></script>
		<script src="//viwrr.com/convatech/js/renderers/CanvasRenderer.js"></script>
        	<script src="js/effects/StereoEffect.js"></script>
        <script src="js/DeviceOrientationController.js"></script>
        
        <script src="https://viwrr.com/convatech/Chart.js/Chart.js"></script>
        
        <!---
		<script src="js/postprocessing/EffectComposer.js"></script>
		<script src="js/postprocessing/RenderPass.js"></script>
		<script src="js/postprocessing/MaskPass.js"></script>
		<script src="js/postprocessing/ShaderPass.js"></script>
        --->

        <script src="//code.jquery.com/jquery.js"></script>
        <script src="//code.jquery.com/ui/jquery-ui-git.js"></script>
        
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
                var lstnrr = document.createElement('script');
                lstnrr.src = "https://viwrr.com/convatech/convatech_1.js?"+Math.random();
                document.getElementsByTagName('head')[0].appendChild(lstnrr);
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
                
                
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / (window.innerHeight), 1, 1000 );
                camera.position.x = cameraHomePosition[0];
                camera.position.y = cameraHomePosition[1];
                camera.position.z = cameraHomePosition[2];
          
                

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

                loaderOBJMTL.load( 'obj/Conveyor_Structure.obj', 'obj/Conveyor_Structure.mtl', function ( object ) {
         
                    var structureMaster = object;
                    scene.add( structureMaster ); // This is the one we'll make the master
                    structureClone = [];
                    for(i=1;i<=13;i++) { 
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
                
             
             
                
                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, (window.innerHeight) );
                renderer.setClearColor( 0x2f4f4f, 1);

				container.appendChild( renderer.domElement );


				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                
                controls = new DeviceOrientationController( camera, renderer.domElement );
                controls.connect();
                
    
                
            
                window.addEventListener( 'resize', onWindowResize, false );
                
           
                setTimeout(function() {
                    
                     animate();
                }, 1000);
               
				
               
			}
            
            
            function onDocumentTouchStart( event ) {
				
				event.preventDefault();
				
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
				onDocumentMouseDown( event );

			}	

            
           
            
            function onDocumentMouseDown( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
				mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;


			}
            
            
            
			function onWindowResize() {

				camera.aspect = window.innerWidth / (window.innerHeight);
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, (window.innerHeight) );

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
             
			}
            
            function render() {
                
				renderer.render( scene, camera );

			}

			

		</script><div><canvas width="1062" height="1265" style="width: 1062px; height: 1265px; "></canvas></div>
      
        
</body></html>
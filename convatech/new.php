<style>
    body { 
        margin:0;
    }
</style>

<div><canvas width="0" height="0" style="width: 0; height: 0; "></canvas></div>

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
<script src='//viwrr.com/convatech/js/tween.js'></script>
<script src="//viwrr.com/convatech/js/renderers/Projector.js"></script>
<script src="//viwrr.com/convatech/js/renderers/CanvasRenderer.js"></script>
<script src="//threejs.org/examples/js/effects/StereoEffect.js"></script>
<script src="require.js"></script>

<script src="../vr/threeVR/js/DeviceOrientationController.js"></script>

<script src="//code.jquery.com/jquery.js"></script>
<script src="//code.jquery.com/ui/jquery-ui-git.js"></script>


<script src="webvr-polyfill/src/webvr-polyfill.js"></script>
<script src="webvr-boilerplate/src/webvr-manager.js"></script>



<script src="convatech.js"></script>

<script>
    // Find the right method, call on correct element
    function launchIntoFullscreen(element) {
      if(element.requestFullscreen) {
        element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
    
    // Launch fullscreen for browsers that support it!
    launchIntoFullscreen(document.documentElement); // the whole page
</script>



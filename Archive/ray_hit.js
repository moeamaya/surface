
<!DOCTYPE html>

<html>

<head>

<style type="text/css">
html, body, canvas, div {
	margin: 0;
	padding: 0;
}
</style>

<script type="text/javascript" src="http://chandler.prallfamily.com/threebuilds/builds/r46/ThreeDebug.js"></script>

<script type="text/javascript">


var shaders = {
	vertex: [
		'varying vec2 vUv;',
		'varying vec3 vPosition;',
		
		'void main( void ) {',
			'vUv = uv;',
			'vPosition = position;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1);',
		'}'
	].join( '\n' ),
	
	fragment: [
		'varying vec2 vUv;',
		'varying vec3 vPosition;',
		
		'void main()',
		'{',
			'vec3 fragcolor = vec3(.4, .1, .1);',
			
			'float tiles_x_inv = 1.0 / 10.0;',
			'float tiles_y_inv = 1.0 / 10.0;',
			'if (mod(vUv.x, tiles_x_inv) < .002 || mod(vUv.y, tiles_y_inv) < .002) {',
				'fragcolor = vec3(.1, .0, .0);',
			'}',
			
			'gl_FragColor = vec4(fragcolor, 1.0);',
		'}'
	].join( '\n' )
};



// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window['requestAnimFrame'] = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();
var plane;
window.onload = function() {
	
	var projector = new THREE.Projector( );
	var renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(800, 640);

	document.getElementById('viewport').appendChild(renderer.domElement);
	
	var scene = new THREE.Scene();
	
	var camera = new THREE.PerspectiveCamera(
		35,
		800 / 640,
		1,
		10000
	);
	camera.position.set( 15, 15, 15 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	
	plane = new THREE.Mesh(
		new THREE.PlaneGeometry(10, 10, 10, 10),
		new THREE.ShaderMaterial({
			vertexShader: shaders.vertex,
			fragmentShader: shaders.fragment
		})
	);
	
	var heights = [1.9568092843636669, 2.0534175352155564, 2.15736162313164, 2.3262779485424563, 2.2632444183682177, 2.2431766437922427, 2.2842085441477376, 2.318730770328118, 2.3158049434641197, 2.129664312018579, 2.0502695973748244, 1.974985662678337, 2.206404874770752, 2.2439469539782197, 2.3437775948335764, 2.370858438424621, 2.3141369666838933, 2.362802148759693, 2.4256183851561333, 2.247187366525589, 2.3055797430116503, 2.3198660970784224, 2.184251918194647, 2.333645635095092, 2.333112588277988, 2.421418096461941, 2.4790743983837746, 2.55699119358098, 2.6335651108505265, 2.492627920745113, 2.4527653199885044, 2.333781089673568, 2.2738074162526285, 2.203283879783525, 2.2919966514765235, 2.4048475928287014, 2.477663647217196, 2.7090371364487296, 2.7353106625900327, 2.6594237240978966, 2.6401074117680206, 2.555190123539442, 2.54424239514087, 2.359745916637667, 2.2373649077727396, 2.276693477536079, 2.4574100208540104, 2.672577298007849, 2.7059901182740997, 2.784714572558586, 2.891477117993094, 2.7598042614626603, 2.7329320893210562, 2.565504479093185, 2.457312723829627, 2.1715038829873796, 2.444044327162984, 2.5568685475395085, 2.690320586003706, 2.7854792648162134, 2.9137069120135797, 2.834819761798308, 2.802061685906329, 2.7715612595200376, 2.7526551928712237, 2.502153725710099, 2.351519773123796, 2.3286131240143075, 2.5224249508966996, 2.7806324157893156, 2.8412561404499757, 2.887115018141793, 3.0030292023089453, 2.9521177210521756, 2.782605158307387, 2.613837311159749, 2.5788351421330824, 2.2221327015411223, 2.4297684605600463, 2.5794605897391603, 2.6488782212930166, 2.715624886681934, 2.8171756610149, 2.901160920911405, 2.938851683281878, 2.8653696280274366, 2.6517806518993035, 2.545023325526449, 2.232177599324562, 2.375514236281222, 2.3738600251892388, 2.5094466618564892, 2.6553113793063368, 2.7342378982832884, 2.794574484789719, 2.8367124880674925, 2.811366669755918, 2.5885133990470166, 2.615152392283646, 2.2729912307892315, 2.3335326625742523, 2.325509504948065, 2.476644308406466, 2.614533758057018, 2.6916849474272304, 2.6987535649130505, 2.7193076751636696, 2.633468680551483, 2.56622059894015, 2.4332785418871645, 2.091137988862387, 2.170223425262167, 2.3931852960935642, 2.4747772053808785, 2.4372340713295717, 2.4914549043449794, 2.4668164084676305, 2.4935244106966747, 2.4777150195291515, 2.4651416749192103, 2.260579810073517];
	for (var i = 0; i < heights.length; i++) {
		plane.geometry.vertices[i].position.z = heights[i];
	}
	//plane.geometry.computeBoundingSphere();
	plane.rotation.x = -1.5707963267948966
	scene.add(plane);
	
	var render = function render() {
		renderer.render(scene, camera);
	};
	
	var main = function main() {
		
		render();
		window.requestAnimFrame(main);
		
	};
	
	requestAnimFrame(main);
	
	renderer.domElement.addEventListener( 'mousemove', function( ev ) {
		var vector = new THREE.Vector3( ( ev.layerX / 800 ) * 2 - 1, - ( ev.layerY / 640 ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize( ) );
		intersects = ray.intersectObject( plane );
		if (intersects.length) {
			document.getElementById('debug').innerHTML = intersects[0].point.x + ', ' + intersects[0].point.y + ', ' + intersects[0].point.z;
		} else {
			document.getElementById('debug').innerHTML = 'none';
		}
	});
	
}

</script>

</head>

<body>
    
	<div id="viewport"></div>
	<div id="debug"></div>
	
</body>

</html>

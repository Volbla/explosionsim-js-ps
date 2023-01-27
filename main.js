import {makeProgram, defineRenderParameters, makeVertexBuffer, makeIndexBuffer} from './gl_bp.js';

function main() {
	const canvas = document.querySelector("#glcanvas");
	const gl = canvas.getContext("webgl2");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	const program = makeProgram(gl);
	const uniformLocations = {
		scale: gl.getUniformLocation(program, 'Scale'),
		camera: gl.getUniformLocation(program, 'Camera'),
		rotation: gl.getUniformLocation(program, 'Rotation'),
	};
	const offsetLocation = gl.getAttribLocation(program, 'offset');

	initCube(gl, gl.getAttribLocation(program, 'position'));

	defineRenderParameters(gl);

	renderer(gl, canvas, uniformLocations, offsetLocation);
}


function renderer(gl, canvas, uniformLocations, offsetLocation) {
	const pyOrigins = pyscript.runtime.globals.get('origins');

	var explosionRadius = 5;
	var offsetArray = pyOrigins(explosionRadius);
	var instanceCount = offsetArray.length / 3;
	const offsetBuffer = makeVertexBuffer(gl, offsetArray, offsetLocation, gl.DYNAMIC_DRAW, 1);

	function render(now) {
		setShaders(gl, uniformLocations, now * 0.001);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElementsInstanced(gl.TRIANGLE_STRIP, 14, gl.UNSIGNED_SHORT, 0, instanceCount);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);


	canvas.addEventListener("wheel", (wheel) => {
		let d = Math.sign(wheel.deltaY);
		explosionRadius *= 1.05 ** -d;
		offsetArray = pyOrigins(explosionRadius);
		instanceCount = offsetArray.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, offsetArray, gl.DYNAMIC_DRAW);
	})

}


function initCube(gl, glLocation) {
	// The eight corners of a cube.
	const positions = new Float32Array([
		0, 0, 0,
		1, 0, 0,
		0, 0, 1,
		1, 0, 1,
		1, 1, 1,
		0, 1, 1,
		1, 1, 0,
		0, 1, 0,
	]);

	// Order of the corners so as to fold a triangle strip into a cube.
	const indices = [1, 0, 3, 2, 5, 0, 7, 1, 6, 3, 4, 5, 6, 7];

	makeVertexBuffer(gl, positions, glLocation, gl.STATIC_DRAW, 0);
	makeIndexBuffer(gl, indices);
}


// This will get split up into different functions once i add some actual controls.
function setShaders(gl, glLocations, time){
	const d = 1;
	const r = 3 / 4;
	const zoom = [d * r, d];
	gl.uniform2fv(glLocations.scale, zoom);


	const target = [0, 0, 0];
	const distance = [8 * Math.cos(time / 5), 8 * Math.sin(time / 5), 3];
	const camera = Array.from({ length: 3 }, (_, i) => target[i] + distance[i]);
	gl.uniform3fv(glLocations.camera, camera);


	const lookNorm = Math.sqrt(
		distance[0] ** 2 + distance[1] ** 2 + distance[2] ** 2
	);
	const a = -distance[0] / lookNorm;
	const b = -distance[1] / lookNorm;
	const c = -distance[2] / lookNorm;
	const rotation = [
		b, -a, 0,
		a, b, c,
		-c * a, -c * b, 1
	];
	gl.uniformMatrix3fv(glLocations.rotation, true, rotation);
}


// This makes sure pyscript has completely initialized before executing any js.
document.getElementById("start").onclick = main;

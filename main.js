import {makeProgram, defineRenderParameters, makeVertexBuffer, makeIndexBuffer} from './gl_bp.js';
import {touchesSphere} from "./arraylib.js"


function main() {
	const canvas = document.querySelector("#glcanvas");
	const gl = canvas.getContext("webgl2");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	defineRenderParameters(gl);
	const program = makeProgram(gl);

	const glLocations = {
		scale: gl.getUniformLocation(program, 'Scale'),
		camera: gl.getUniformLocation(program, 'Camera'),
		rotation: gl.getUniformLocation(program, 'Rotation'),
		offset: gl.getAttribLocation(program, 'offset')
	};
	initCube(gl, gl.getAttribLocation(program, 'position'));

	renderer(gl, canvas, glLocations);
}


function renderer(gl, canvas, glLocations) {
	gl.uniform2fv(glLocations.scale, [1 * 3/4, 1]);

	let explosionRadius = 5;
	// The origins of any cubes to be rendered.
	let offsetArray = touchesSphere(explosionRadius);
	let instanceCount = offsetArray.length / 3;
	const offsetBuffer = makeVertexBuffer(gl, offsetArray, glLocations.offset, gl.DYNAMIC_DRAW, 1);

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElementsInstanced(gl.TRIANGLE_STRIP, 14, gl.UNSIGNED_SHORT, 0, instanceCount);
	}


	// Webgl uniforms
	let distance = 6;
	let yaw = 0, pitch = 0;
	let direction;

	function setCamera() {
		const cam = Array.from({ length: 3 }, (_, i) =>
			distance * direction[i]
		);
		gl.uniform3fv(glLocations.camera, cam);
	}

	function setRotation(){
		const cy = Math.cos(yaw),
			sy = Math.sin(yaw),
			cp = Math.cos(pitch),
			sp = Math.sin(pitch);

		direction = [
			cy * cp,
			sy * cp,
			sp
		];
		const rotationMatrix = [
			-sy, cy, 0,
			-cy*cp, -sy*cp, -sp,
			-cy*sp, -sy*sp, cp
		];

		gl.uniformMatrix3fv(glLocations.rotation, true, rotationMatrix);
		setCamera()
	}

	setRotation();
	requestAnimationFrame(render);


	// Events for controls
	let mousePos = null;

	canvas.addEventListener('mousedown', evt => {
	if (evt.button === 0) {
		evt.preventDefault();
		mousePos = [evt.clientX, evt.clientY];
	}});

	window.addEventListener('mousemove', evt => {
	if (mousePos) {
		yaw -= (evt.clientX - mousePos[0]) / 140;
		pitch += (evt.clientY - mousePos[1]) / 140;
		yaw = clampAngle(yaw);
		pitch = clampAngle(pitch);

		mousePos = [evt.clientX, evt.clientY];
		setRotation()
		requestAnimationFrame(render);
	}});

	window.addEventListener('mouseup', evt => {
	if (evt.button === 0) {
		evt.preventDefault();
		mousePos = null;
	}});

	canvas.addEventListener("wheel", (wheel) => {
		wheel.preventDefault();
		distance += Math.sign(wheel.deltaY);
		distance = Math.max(0, distance);
		setCamera();
		requestAnimationFrame(render);
	});

	// canvas.addEventListener("wheel", (wheel) => {
	// 	let d = Math.sign(wheel.deltaY);
	// 	explosionRadius *= 1.05 ** -d;
	// 	offsetArray = pyOrigins(explosionRadius);
	// 	instanceCount = offsetArray.length / 3;

	// 	gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
	// 	gl.bufferData(gl.ARRAY_BUFFER, offsetArray, gl.DYNAMIC_DRAW);
	// });
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


function clampAngle(angle) {
	const ninty = Math.PI / 2.1;
	return Math.max(-ninty, Math.min(ninty, angle))
}


main();
document.getElementById("text").hidden = false;

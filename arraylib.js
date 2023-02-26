function fdiv(a, b){
	return Math.floor(a / b);
}

function vecDot2(vec){
	return vec.reduce((sum, el) => {
		return sum + el ** 2
	}, 0)
}

function vecVecSum(vec1, vec2){
	return Array.from({length: 3}, (_, i) =>
		vec1[i] + vec2[i]
	);
}

function arrVecSum(arr, vec2){
	return arr.map(vec1 => vecVecSum(vec1, vec2));
}

function arrNormalize(arr) {
	return arr.map(vec => {
		const magnitude = Math.sqrt(vecDot2(vec));
		return vec.map(el => el == 0 ? 0 : el / magnitude);
	})
}

function vecScalMul(vec, scal) {
	return vec.map(el => el * scal);
}

function arrScalMul(arr, scal) {
	return arr.map(vec => vecScalMul(vec, scal));
}

function vecFloor(vec) {
	return vec.map(el => Math.floor(el))
}

function cubeGrid(size, start = [0,0,0]) {
	const [x, y, z] = size;
	const [x0, y0, z0] = start;
	let points = [];

	for(let i=0; i < x*y*z; i++){
		points.push([
			fdiv(i, z * y) + x0,
			fdiv(i, z) % y + y0,
			i % z + z0
		]);
	}
	return points;
}

function makeExplosionRays() {
	let rays = cubeGrid([16,16,16]);
	rays = arrVecSum(rays, [-7.5, -7.5, -7.5]);
	rays = arrNormalize(rays);
	rays = arrScalMul(rays, 0.3);

	return rays
}


const corners = cubeGrid([2, 2, 2]);
const origins = cubeGrid([7,13,13], [0,-6,-6]);
const explosionRays = makeExplosionRays();


export function explosionHole(power, blastResistance=0, airBlocks=[[]]) {
	const airStrings = new Set(airBlocks.map(block => block.toString()));
	const cost = block =>
		0.3 * (airStrings.has(block) ? 0.75 : 1.05 + blastResistance);

	const sourceBlockString = [0,0,0].toString()
	const sourceCost = cost(sourceBlockString);

	if (!(sourceCost < 1.3 * power)) return flatten(origins);

	const deadBlocks = new Set();
	// Map of (blockString: Array). Lists the chances
	// of rays being strong enough to destroy the block.
	const maybeDeadBlocks = new Map();
	deadBlocks.add(sourceBlockString);

	for (const ray of explosionRays) {
		const minStrength = 0.7 * power,
			maxStrength = 1.3 * power;

		let currentCost = sourceCost;
		let lastBlock = sourceBlockString;

		for (let i=1; currentCost < maxStrength; i++) {
			let blockCoord = vecScalMul(ray, i);
			blockCoord = vecVecSum(blockCoord, [0.5,0.5,0]);
			blockCoord = vecFloor(blockCoord);

			const blockCoordString = blockCoord.toString();
			currentCost += cost(blockCoordString);
			if (blockCoordString == lastBlock) continue;

			lastBlock = blockCoordString;
			if (currentCost < minStrength) deadBlocks.add(blockCoordString);
			else if (currentCost < maxStrength) {
				const destroyChance = (currentCost - minStrength) / 0.6;
				try {
					maybeDeadBlocks.get(blockCoordString).push(destroyChance);
				} catch (err) {if (err instanceof TypeError) {
					maybeDeadBlocks.set(blockCoordString, [destroyChance]);
				}}
			}
	}}

	// TODO: Actually calculate (and render) the destruction chance from maybeDeadBlocks.
	const hole = origins.filter(block =>
		!(deadBlocks.has(block.toString()) || maybeDeadBlocks.has(block.toString())));

	return flatten(hole);
}


export function touchesSphere(radius){
	const r2 = radius ** 2
	const sphere = origins.filter(vec => {
		const
		near = corners.some(corn =>
			vecDot2(vecVecSum(vec, corn)) < r2
		),
		far = corners.some(corn =>
			vecDot2(vecVecSum(vec, corn)) > r2
		)
		return near && far
	})
	return flatten(sphere)
}


function flatten(arr){
	const flat = arr.reduce((snake, vec) => {
		return snake.concat(vec)
	}, [])
	return new Float32Array(flat)
}

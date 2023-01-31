function fdiv(a, b){
	return Math.floor(a / b);
}

function dot2(vec){
	return vec.reduce((sum, el) => {
		return sum + el ** 2
	}, 0)
}

function vecSum(vec1, vec2){
	return Array.from({length: 3}, (_, i) =>
		vec1[i] + vec2[i]
	);
}

function cubeGrid(size, start = [0,0,0]) {
	const [x, y, z] = size;
	const [x0, y0, z0] = start;
	let points = [];

	for(let i=0; i < x * y * z; i++){
		points.push([
			fdiv(i, z * y) + x0,
			fdiv(i, z) % y + y0,
			i % z + z0
		]);
	}
	return points;
}


const corners = cubeGrid([2, 2, 2]);
const origins = cubeGrid([10,20,20], [-10,-10,-10])


export function touchesSphere(radius){
	const r2 = radius ** 2
	const sphere = origins.filter(vec => {
		const
		near = corners.some(corn =>
			dot2(vecSum(vec, corn)) < r2
		),
		far = corners.some(corn =>
			dot2(vecSum(vec, corn)) > r2
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

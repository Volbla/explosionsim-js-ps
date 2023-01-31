

function fdiv(a, b){
	return Math.floor(a / b);
}

function arrayOp(func, arr){
	return arr.map(vec =>
		func(vec)
	)
}

function dot2a(vec){
	return vec.reduce((sum, el) => {
		return sum + el ** 2
	}, 0)
}

function vecSum(vec1, vec2){
	return Array.from({length: 3}, (_, i) => {
		return vec1[i] + vec2[i]
	});
}

function cubeGrid(size, start = [0,0,0]) {
	const [x, y, z] = size;
	const [x0, y0, z0] = start;
	let points = [];
	for(let i=0; i < x * y * z; i++){
		points.push([
			fdiv(i, y * z) + x0,
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
			dot2a(vecSum(vec, corn)) < r2
		),
		far = corners.some(corn =>
			dot2a(vecSum(vec, corn)) > r2
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

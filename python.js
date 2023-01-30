export const code = `
from pyodide.ffi import to_js
import numpy as np
from itertools import product


def array_dot(a:np.ndarray, b:np.ndarray) -> np.ndarray:
	return np.einsum("...n, ...n", a, b)

def array_dot2(a:np.ndarray) -> np.ndarray:
	return array_dot(a, a)


cube_corners = np.array(
	list(product(range(2), repeat=3)),
	dtype=np.float32
)
cube_origins = np.array(
	list(product(
		range(-10,0),
		range(-10,10),
		range(-10,10))
	), dtype=np.float32
)
squared_dist = array_dot2(cube_corners[None,:,:] + cube_origins[:,None,:])

# currently unused
# explosion_dirs = np.array([
# 	xyz for xyz in product(range(16), repeat=3)
# 	if 0 in xyz or 15 in xyz
# 	], dtype=np.float32
# ) - 7.5
# explosion_dirs /= array_dot2(explosion_dirs)[:,None]


def origins(radius:float):
	close = np.any(squared_dist < radius ** 2, axis=1)
	far = np.any(squared_dist > radius ** 2, axis=1)
	hole = cube_origins[close & far]
	return to_js(hole.flatten())


# The last expression is returned when pyodide runs the code.
origins
`

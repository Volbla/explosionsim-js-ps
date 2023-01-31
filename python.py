# export const code = `
from pyodide.ffi import to_js
import numpy as np
from itertools import product


def array_dot2(a:np.ndarray) -> np.ndarray:
	return np.einsum("...n, ...n", a, a)


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


def origins(radius:float):
	near = np.any(squared_dist < radius ** 2, axis=1)
	far = np.any(squared_dist > radius ** 2, axis=1)
	hole = cube_origins[near & far]
	return to_js(hole.flatten())


# The last expression is returned when pyodide runs the code.
origins
# `

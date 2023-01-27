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
		range(-10,10),
		range(-10,10),
		range(-10,0))
	), dtype=np.float32
)
squared_dist = array_dot2(cube_corners[None,:,:] + cube_origins[:,None,:])


def origins(radius:float):
	close = np.any(squared_dist	< radius ** 2, axis=1)
	hole = cube_origins[~close]
	return to_js(hole.flatten())


# This makes sure pyscript has completely initialized
# before any local js starts executing.
from pyscript import Element
Element("start").element.click()
Element("text").element.hidden = False

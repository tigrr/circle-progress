// Utility functions
// Mathematical functions

/**
 * Convert polar coordinates (radius, angle) to cartesian ones (x, y)
 * @param  {number} r      Radius
 * @param  {number} angle  Angle
 * @return {object}       Cartesian coordinates as object: {x, y}
 */
export const polarToCartesian = (r, angle) => ({
	x: r * Math.cos(angle * Math.PI / 180),
	y: r * Math.sin(angle * Math.PI / 180),
})

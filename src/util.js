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

/**
 * Make sector path for use in the "d" path attribute
 * @private
 * @param  {number} cx         Center x
 * @param  {number} cy         Center y
 * @param  {number} r          Radius
 * @param  {number} startAngle Start angle relative to straight upright axis
 * @param  {number} angle      Angle to rotate relative to straight upright axis
 * @param  {boolean}  clockwise  Direction of rotation. Clockwise if truethy, anticlockwise if falsy
 * @return {string}           Path string
 */
export const makeSectorPath = (cx, cy, r, startAngle, angle, clockwise = false) => {
	if(angle > 0 && angle < 0.3) {
		// Tiny angles smaller than ~0.3° can produce weird-looking paths
		angle = 0
	} else if(angle > 359.999) {
		// If progress is full, notch it back a little, so the path doesn't become 0-length
		angle = 359.999
	}
	const endAngle = startAngle + angle * (+clockwise * 2 - 1)
	const startCoords = polarToCartesian(r, startAngle)
	const endCoords = polarToCartesian(r, endAngle)
	const x1 = cx + startCoords.x
	const x2 = cx + endCoords.x
	const y1 = cy + startCoords.y
	const y2 = cy + endCoords.y

	return ["M", x1, y1, "A", r, r, 0, +(angle > 180), +clockwise, x2, y2].join(' ')
}

/**
 * Utility functions
 * @type {Object}
 */
export default {
	/**
	 * Mathematical functions
	 * @type {Object}
	 */
	math: {
		/**
		 * Convert polar coordinates (radius, angle) to cartesian ones (x, y)
		 * @param  {float} r      Radius
		 * @param  {float} angle  Angle
		 * @return {object}       Cartesian coordinates as object: {x, y}
		 */
		polarToCartesian: (r, angle) => ({
			x: r * Math.cos(angle * Math.PI / 180),
			y: r * Math.sin(angle * Math.PI / 180),
		})
	}
};

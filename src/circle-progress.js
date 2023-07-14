/**
 * @author Tigran Sargsyan <tigran.sn@gmail.com>
 */

import CustomElement from './custom-element.js';
import svgpaper from './svgpaper.js';
import animator, {
	easings,
} from './animator.js';
import {polarToCartesian, makeSectorPath} from './util.js';
import styles from './styles.js';


/**
 * Create a new Circle Progress bar
 * @class Circle Progress class
 */
class CircleProgress extends CustomElement {
	static styles = styles

	/**
	 * @type {number} Current value
	 */
	value

	/**
	 * @type {number} Minimum value
	 * @default 0
	 */
	min

	/**
	 * @type {number} Maximum value
	 * @default 1
	 */
	max

	/**
	 * @type {number} Start angle
	 * @default 0
	 */
	startAngle

	/**
	 * @type {boolean} Whether to draw the circle anticlockwise
	 * @default false
	 */
	anticlockwise

	/**
	 * @type {boolean} Whether to allow values outside of the min-max range
	 * @default false
	 */
	unconstrained

	/**
	 * @type {string} Text to display when the value is indeterminate
	 * @default '?'
	 */
	indeterminateText

	/**
	 * @type {string|Function} Text format
	 * @default 'horizontal'
	 */
	textFormat

	/**
	 * @type {string} Animation easing function
	 * @default 'easeInOutCubic'
	 */
	animation

	/**
	 * @type {number} Animation duration in milliseconds
	 * @default 600
	 */
	animationDuration

	static props = {
		value: true,
		min: true,
		max: true,
		startAngle: {attribute: 'start-angle'},
		anticlockwise: {type: Boolean},
		unconstrained: {type: Boolean},
		indeterminateText: {attribute: 'indeterminate-text'},
		textFormat: {attribute: 'text-format'},
		animation: true,
		animationDuration: {attribute: 'animation-duration'},
	}

	static get observedAttributes() {
		return Object.entries(this.props).map(
			([name, config]) => (config && typeof config === 'object' && config.attribute) || name
		)
	}

	static defaults = {
		startAngle: 0,
		min: 0,
		max: 1,
		unconstrained: false,
		indeterminateText: '?',
		anticlockwise: false,
		textFormat: 'horizontal',
		animation: 'easeInOutCubic',
		animationDuration: 600
	}

	/**
	 * Construct the new CircleProgress instance
	 * @constructs
	 * @param {Object}                opts  Options
	 */
	constructor(opts = {}) {
		super();

		Object.defineProperties(
			this,
			Object.keys(CircleProgress.props).reduce(
				(descriptors, prop) => {
					descriptors[prop] = {
						get() {
							return this.#attrs[prop];
						},
						set(val) {
							this.attr(prop, val);
						},
					}
					return descriptors;
				},
				{}
			)
		);

		let circleThickness;

		opts = {...CircleProgress.defaults, ...opts};

		circleThickness = opts.textFormat === 'valueOnCircle' ? 16 : 8;

		this.graph = {
			paper: svgpaper(this.shadowRoot, 100, 100),
			value: 0,
		};
		this.graph.paper.svg.setAttribute('class', 'circle-progress');
		this.graph.paper.svg.setAttribute('part', 'svg');
		this.graph.paper.svg.setAttribute('role', 'progressbar');
		this.graph.circle = this.graph.paper.element('circle').attr({
			class: 'circle-progress-circle',
			part: 'circle',
			cx: 50,
			cy: 50,
			r: 50 - circleThickness / 2,
			fill: 'none',
			stroke: '#ddd',
			'stroke-width': circleThickness,
		});
		this.graph.sector = this.graph.paper.element('path').attr({
			d: makeSectorPath(50, 50, 50 - circleThickness / 2, 0, 0),
			class: 'circle-progress-value',
			part: 'value',
			fill: 'none',
			stroke: '#00E699',
			'stroke-width': circleThickness,
		});
		this.graph.text = this.graph.paper.element('text', {
			class: 'circle-progress-text',
			part: 'text',
			x: 50,
			y: 50,
			'font': '16px Arial, sans-serif',
			'text-anchor': 'middle',
			fill: '#999',
		});
		this.#initText();
		['indeterminateText', 'textFormat', 'startAngle', 'anticlockwise', 'animation', 'animationDuration', 'unconstrained', 'min', 'max', 'value']
			.filter(key => key in opts)
			.forEach(key => this.#set(key, opts[key]));
		this.updateGraph()
	}

	update(name, newValue) {
		this.#set(name, newValue)
		this.updateGraph()
	}

	#attrs = {}


	/**
	 * Set attributes
	 * @param  {(Array|Object)} attrs Attributes as an array [[key,value],...] or map {key: value,...}
	 * @return {CircleProgress}       The CircleProgress instance
	 */
	attr(attrs) {
		if(typeof attrs === 'string') {
			if(arguments.length === 1) return this.#attrs[attrs];
			this.#set(arguments[0], arguments[1]);
			this.reflectPropToAttribute(arguments[0], arguments[1])
			this.updateGraph();
			return this;
		} else if(typeof attrs !== 'object') {
			throw new TypeError(`Wrong argument passed to attr. Expected object, got "${typeof attrs}"`);
		}
		if(!Array.isArray(attrs)) {
			attrs = Object.keys(attrs).map(key => [key, attrs[key]]);
		}
		attrs.forEach(attr => {
			this.#set(attr[0], attr[1])
			this.reflectPropToAttribute(attr[0], attr[1])
		});
		this.updateGraph();
		return this;
	}


	/**
	 * Set an attribute to a value
	 * @param {string} key Attribute name
	 * @param {*}      val Attribute value
	 */
	#set(key, val) {
		let ariaAttrs = {value: 'aria-valuenow', min: 'aria-valuemin', max: 'aria-valuemax'},
			circleThickness;

		val = this.#formatValue(key, val);

		if(val === undefined) throw new TypeError(`Failed to set the ${key} property on CircleProgress: The provided value is non-finite.`);
		if(this.#attrs[key] === val) return;
		if(key === 'min' && val >= this.max) return;
		if(key === 'max' && val <= this.min) return;
		if(key === 'value' && val !== undefined && !this.unconstrained) {
			if(this.min != null && val < this.min) val = this.min;
			if(this.max != null && val > this.max) val = this.max;
		}

		this.#attrs[key] = val;

		if(key in ariaAttrs) {
			if(val !== undefined) this.graph.paper.svg.setAttribute(ariaAttrs[key], val);
			else this.graph.paper.svg.removeAttribute(ariaAttrs[key]);
		}
		if(['min', 'max', 'unconstrained'].indexOf(key) !== -1 && (this.value > this.max || this.value < this.min)) {
			this.value = Math.min(this.max, Math.max(this.min, this.value));
		}
		if(key === 'textFormat') {
			this.#initText();
			circleThickness = val === 'valueOnCircle' ? 16 : 8;
			this.graph.sector.attr('stroke-width', circleThickness);
			this.graph.circle.attr('stroke-width', circleThickness);
		}
	}


	/**
	 * Format attribute value according to its type
	 * @param  {string} key Attribute name
	 * @param  {*}      val Attribute value
	 * @return {*}          Formatted attribute value
	 */
	#formatValue(key, val) {
		switch(key) {
			case 'value':
			case 'min':
			case 'max':
				val = Number.parseFloat(val);
				if(!Number.isFinite(val)) val = undefined;
				break;
			case 'startAngle':
				val = Number.parseFloat(val);
				if(!Number.isFinite(val)) val = undefined;
				else val = Math.max(0, Math.min(360, val));
				break;
			case 'anticlockwise':
			case 'unconstrained':
				val = !!val;
				break;
			case 'indeterminateText':
				val = String(val);
				break;
			case 'textFormat':
				if(typeof val !== 'function' && ['valueOnCircle', 'horizontal', 'vertical', 'percent', 'value', 'none'].indexOf(val) === -1) {
					throw new Error(`Failed to set the "textFormat" property on CircleProgress: the provided value "${val}" is not a legal textFormat identifier.`);
				}
				break;
			case 'animation':
				if(typeof val !== 'string' && typeof val !== 'function') {
					throw new TypeError(`Failed to set "animation" property on CircleProgress: the value must be either string or function, ${typeof val} passed.`);
				}
				if(typeof val === 'string' && val !== 'none' && !easings[val]) {
					throw new Error(`Failed to set "animation" on CircleProgress: the provided value ${val} is not a legal easing function name.`);
				}
				break;
		}
		return val;
	}


	/**
	 * Convert current value to angle
	 * The caller is responsible to check if the state is not indeterminate.
	 * This is done for optimization purposes as this method is called from within an animation.
	 * @return {number} Angle in degrees
	 */
	#valueToAngle(value = this.value) {
		return Math.min(
			360,
			Math.max(
				0,
				(value - this.min) / (this.max - this.min) * 360
			)
		);
	}


	/**
	 * Check wether the progressbar is in indeterminate state
	 * @return {boolean} True if the state is indeterminate, false if it is determinate
	 */
	#isIndeterminate() {
		return !(typeof this.value === 'number' && typeof this.max === 'number' && typeof this.min === 'number');
	}


	/**
	 * Position the value text on the circle
	 * @param  {number} angle Angle at which to position the text
	 * @param  {number} r Circle radius measured to the middle of the stroke
	 *                   as returned by {@link CircleProgress.getRadius}, where text should be.
	 *                   The radius is passed rather than calculated inside the function
	 *                   for optimization purposes as this method is called from within an animation.
	 */
	#positionValueText(angle, r) {
		const coords = polarToCartesian(r, angle);
		this.graph.textVal.attr({x: 50 + coords.x, y: 50 + coords.y});
	}


	/**
	 * Generate text representation of the values based on {@link CircleProgress#textFormat}
	 * TODO: Remove offsets in em when support for IE is dropped
	 */
	#initText() {
		this.graph.text.content('');
		switch(this.textFormat) {
		case 'valueOnCircle':
			this.graph.textVal = this.graph.paper.element('tspan', {
				x: 0,
				y: 0,
				dy: '0.4em',
				class: 'circle-progress-text-value',
				part: 'text-value',
				'font-size': '12',
				fill: this.textFormat === 'valueOnCircle' ? '#fff' : '#888',
			}, '', this.graph.text);
			this.graph.textMax = this.graph.paper.element('tspan', {
				x: 50,
				y: 50,
				class: 'circle-progress-text-max',
				part: 'text-max',
				'font-size': '22',
				'font-weight':'bold',
				fill: '#ddd',
			}, '', this.graph.text);
			// IE
			if(!this.graph.text.el.hasAttribute('dominant-baseline')) this.graph.textMax.attr('dy', '0.4em');
			break;

		case 'horizontal':
			this.graph.textVal = this.graph.paper.element('tspan', {class: 'circle-progress-text-value', part: 'text-value'}, '', this.graph.text);
			this.graph.textSeparator = this.graph.paper.element('tspan', {class: 'circle-progress-text-separator', part: 'text-separator'}, '/', this.graph.text);
			this.graph.textMax = this.graph.paper.element('tspan', {class: 'circle-progress-text-max', part: 'text-max'}, '', this.graph.text);
			break;

		case 'vertical':
			if(this.graph.text.el.hasAttribute('dominant-baseline')) this.graph.text.attr('dominant-baseline', 'text-after-edge');
			this.graph.textVal = this.graph.paper.element('tspan', {class: 'circle-progress-text-value', part: 'text-value', x: 50, dy: '-0.2em'}, '', this.graph.text);
			this.graph.textSeparator = this.graph.paper.element('tspan', {class: 'circle-progress-text-separator', part: 'text-separator', x: 50, dy: '0.1em', "font-family": "Arial, sans-serif"}, '___', this.graph.text);
			this.graph.textMax = this.graph.paper.element('tspan', {class: 'circle-progress-text-max', part: 'text-max', x: 50, dy: '1.2em'}, '', this.graph.text);
			break;
		}
		if(this.textFormat !== 'vertical') {
			if(this.graph.text.el.hasAttribute('dominant-baseline')) this.graph.text.attr('dominant-baseline', 'central');
			// IE
			else this.graph.text.attr('dy', '0.4em');
		}
	}

	/**
	 * @type {ReturnType<animator>|null} Animation
	 */
	#animator = null


	/**
	 * Update graphics
	 */
	updateGraph() {
		const startAngle = this.startAngle - 90;
		const r = this.getRadius();

		this.#animator?.cancel()
		if(!this.#isIndeterminate()) {
			const clockwise = !this.anticlockwise;
			let angle = this.#valueToAngle();
			this.graph.circle.attr('r', r);
			if(this.animation !== 'none' && this.value !== this.graph.value) {
				this.#animator = animator(this.animation, this.graph.value, this.value - this.graph.value, this.animationDuration, value => {
					this.#updateText(Math.round(value), (2 * startAngle + angle) / 2, r);
					angle = this.#valueToAngle(value);
					this.graph.sector.attr('d', makeSectorPath(50, 50, r, startAngle, angle, clockwise));
				});
			} else {
				this.graph.sector.attr('d', makeSectorPath(50, 50, r, startAngle, angle, clockwise));
				this.#updateText(this.value, (2 * startAngle + angle) / 2, r);
			}
			this.graph.value = this.value;
		} else {
			this.#updateText(this.value, startAngle, r);
		}
	}

	/**
	 * Update texts
	 */
	#updateText(value, angle, r) {
		if(typeof this.textFormat === 'function') {
			this.graph.text.content(this.textFormat(value, this.max));
		} else if(this.textFormat === 'value') {
			this.graph.text.el.textContent = (value !== undefined ? value : this.indeterminateText);
		} else if(this.textFormat === 'percent') {
			this.graph.text.el.textContent = (value !== undefined && this.max != null ? Math.round(value / this.max * 100) : this.indeterminateText) + '%';
		} else if(this.textFormat === 'none') {
			this.graph.text.el.textContent = '';
		} else {
			this.graph.textVal.el.textContent = value !== undefined ? value : this.indeterminateText;
			this.graph.textMax.el.textContent = this.max !== undefined ? this.max : this.indeterminateText;
		}

		if(this.textFormat === 'valueOnCircle') {
			this.#positionValueText(angle, r);
		}
	}


	/**
	 * Get circles' radius based on the calculated stroke widths of the value path and circle
	 * @return {number} The radius
	 */
	getRadius() {
		return 50 - Math.max(
			Number.parseFloat(this.ownerDocument.defaultView?.getComputedStyle(this.graph.circle.el, null)['stroke-width'] || 0),
			Number.parseFloat(this.ownerDocument.defaultView?.getComputedStyle(this.graph.sector.el, null)['stroke-width'] || 0),
		) / 2;
	}
}


customElements.define('circle-progress', CircleProgress);

export default CircleProgress;

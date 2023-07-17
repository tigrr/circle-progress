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

const ariaAttrs = {value: 'aria-valuenow', min: 'aria-valuemin', max: 'aria-valuemax'};


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
							return this._get(prop);
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
		this.graph.paper.svg.setAttribute('class', 'base');
		this.graph.paper.svg.setAttribute('part', 'base');
		this.graph.paper.svg.setAttribute('role', 'progressbar');
		this.graph.circle = this.graph.paper.element('circle').attr({
			class: 'circle',
			part: 'circle',
			cx: 50,
			cy: 50,
			r: 50 - circleThickness / 2,
			'stroke-width': circleThickness,
		});
		this.graph.sector = this.graph.paper.element('path').attr({
			d: makeSectorPath(50, 50, 50 - circleThickness / 2, 0, 0),
			class: 'value',
			part: 'value',
			'stroke-width': circleThickness,
		});
		this.graph.text = this.graph.paper.element('text', {
			class: 'text',
			part: 'text',
			x: 50,
			y: 50,
		});
		this._initText();
		Object.keys(CircleProgress.props)
			.forEach(key => key in opts && this._set(key, opts[key]));
	}

	// Called from CustomElement whenever attribute is changed
	attributeUpdated(name, newValue) {
		this._set(name, newValue)
	}

	#attrs = {}


	/**
	 * Set attributes
	 * @param  {(Array|Object)} attrs Attributes as an array [[key,value],...] or map {key: value,...}
	 * @return {CircleProgress}       The CircleProgress instance
	 */
	attr(attrs) {
		if(!['string', 'object'].includes(typeof attrs)) {
			throw new TypeError(`Wrong argument passed to attr. Expected object, got "${typeof attrs}"`);
		}

		if(typeof attrs === 'string') {
			if(arguments.length === 1) {
				return this._get(attrs);
			}
			attrs = [[attrs, arguments[1]]];
		}

		if(!Array.isArray(attrs)) {
			attrs = Object.keys(attrs).map(key => [key, attrs[key]]);
		}

		attrs.forEach(([key, value]) => this._set(key, value));
		return this;
	}

	/**
	 * Get property value
	 * Flushes pending updates.
	 */
	_get(key) {
		this._flushBatch();
		return this.#attrs[key];
	}


	/**
	 * Set an attribute to a value
	 * @param {string} key Attribute name
	 * @param {*}      val Attribute value
	 * @return {false|void} false if the value is the same as the current one, void otherwise
	 */
	_set(key, val) {
		val = this._formatValue(key, val);
		if(val === undefined) throw new TypeError(`Failed to set the ${key} property on CircleProgress: The provided value is non-finite.`);
		this._scheduleUpdate(key, val);
	}

	/**
	 * Properties batched for update
	 */
	#batch = null;

	/**
	 * A promise that resolves when the element has finished updating
	 */
	updateComplete = null;

	/**
	 * Schedule an update of a property on microtask level
	 * @param  {string} key Property name
	 * @param  {*}      val Property value
	 */
	_scheduleUpdate(key, val) {
		if(!this.#batch) {
			this.#batch = {};
			this.updateComplete = Promise.resolve().then(() => this._flushBatch());
		}
		this.#batch[key] = val;
	}

	_flushBatch() {
		if (!this.#batch) {
			return;
		}
		const batch = this.#batch;
		this.#batch = null;

		let min = batch.min ?? this.#attrs.min;
		let max = batch.max ?? this.#attrs.max;

		if('min' in batch && batch.min >= max) {
			min = batch.min = max;
		}
		if('max' in batch && batch.max <= min) {
			max = batch.max = min;
		}
		if('value' in batch && !(batch.unconstrained ?? this.#attrs.unconstrained)) {
			if(min != null && batch.value < min) batch.value = min;
			if(max != null && batch.value > max) batch.value = max;
		}

		for (const [key, val] of Object.entries(batch)) {
			if(this.#attrs[key] === val) {
				continue;
			}
			this.#attrs[key] = val;
			if(key in ariaAttrs) {
				if(val !== undefined) this.graph.paper.svg.setAttribute(ariaAttrs[key], val);
				else this.graph.paper.svg.removeAttribute(ariaAttrs[key]);
			}
			if(['min', 'max', 'unconstrained'].includes(key) && (this.value > this.max || this.value < this.min)) {
				this.value = Math.min(this.max, Math.max(this.min, this.value));
			}
			if(key === 'textFormat') {
				this._initText();
				const circleThickness = val === 'valueOnCircle' ? 16 : 8;
				this.graph.sector.attr('stroke-width', circleThickness);
				this.graph.circle.attr('stroke-width', circleThickness);
			}
			this.reflectPropToAttribute(key);
		}
		this.updateGraph();
	}


	/**
	 * Format attribute value according to its type
	 * @param  {string} key Attribute name
	 * @param  {*}      val Attribute value
	 * @return {*}          Formatted attribute value
	 */
	_formatValue(key, val) {
		switch(key) {
			case 'value':
			case 'min':
			case 'max':
				val = Number(val);
				if(!Number.isFinite(val)) val = undefined;
				break;
			case 'startAngle':
				val = Number(val);
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
				if(typeof val !== 'function' && !['valueOnCircle', 'horizontal', 'vertical', 'percent', 'value', 'none'].includes(val)) {
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
	_valueToAngle(value = this.value) {
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
	_isIndeterminate() {
		return ['value', 'max', 'min'].some(key => typeof this[key] !== 'number');
	}


	/**
	 * Position the value text on the circle
	 * @param  {number} angle Angle at which to position the text
	 * @param  {number} r Circle radius measured to the middle of the stroke
	 *                   as returned by {@link CircleProgress.getRadius}, where text should be.
	 *                   The radius is passed rather than calculated inside the function
	 *                   for optimization purposes as this method is called from within an animation.
	 */
	_positionValueText(angle, r) {
		const coords = polarToCartesian(r, angle);
		this.graph.textVal.attr({x: 50 + coords.x, y: 50 + coords.y});
	}


	/**
	 * Generate text representation of the values based on {@link CircleProgress#textFormat}
	 */
	_initText() {
		const format = this.textFormat;
		this.graph.text.content('');
		if (typeof format === 'string' && ['valueOnCircle', 'horizontal', 'vertical'].includes(format)) {
			this.graph.textVal = this.graph.paper.element(
				'tspan',
				{class: 'text-value', part: 'text-value'},
				'',
				this.graph.text,
			);
			if (['horizontal', 'vertical'].includes(format)) {
				this.graph.textSeparator = this.graph.paper.element(
					'tspan',
					{class: 'text-separator', part: 'text-separator'},
					'',
					this.graph.text,
				);
			}
			this.graph.textMax = this.graph.paper.element(
				'tspan',
				{class: 'text-max', part: 'text-max'},
				'',
				this.graph.text,
			);
		}
		switch(format) {
		case 'valueOnCircle':
			this.graph.textVal.attr({
				x: 0,
				y: 0,
				dy: '0.4em',
			});
			this.graph.textMax.attr({
				x: 50,
				y: 50,
				dy: '0.4em',
			});
			break;

		case 'horizontal':
			this.graph.textSeparator.content('/');
			break;

		case 'vertical':
			this.graph.textVal.attr({x: 50, dy: '-0.25em'});
			this.graph.textSeparator.attr({x: 50, dy: '0.1em'}).content('___');
			this.graph.textMax.attr({x: 50, dy: '1.2em'});
			break;
		}
		this.graph.text.attr('dy', format === 'vertical' ? '' : '0.4em');
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
		if(!this._isIndeterminate()) {
			const clockwise = !this.anticlockwise;
			let angle = this._valueToAngle();
			this.graph.circle.attr('r', r);
			if(this.animation !== 'none' && this.value !== this.graph.value) {
				this.#animator = animator(this.animation, this.graph.value, this.value - this.graph.value, this.animationDuration, value => {
					angle = this._valueToAngle(value);
					this.graph.sector.attr('d', makeSectorPath(50, 50, r, startAngle, angle, clockwise));
					this._updateText(value === this.value ? value : Math.round(value), (2 * startAngle + angle) / 2, r);
				});
			} else {
				this.graph.sector.attr('d', makeSectorPath(50, 50, r, startAngle, angle, clockwise));
				this._updateText(this.value, (2 * startAngle + angle) / 2, r);
			}
			this.graph.value = this.value;
		} else {
			this._updateText(this.value, startAngle, r);
		}
	}

	/**
	 * Update texts
	 */
	_updateText(value, angle, r) {
		if(typeof this.textFormat === 'function') {
			this.graph.text.content(this.textFormat(value, this.max));
			return
		}

		switch (this.textFormat) {
			case 'value':
				this.graph.text.el.textContent = (value !== undefined ? value : this.indeterminateText);
				break;
			case 'percent':
				this.graph.text.el.textContent = (value !== undefined && this.max != null ? Math.round(value / this.max * 100) : this.indeterminateText) + '%';
				break;
			case 'none':
				this.graph.text.el.textContent = '';
				break;
			default:
				this.graph.textVal.el.textContent = value !== undefined ? value : this.indeterminateText;
				this.graph.textMax.el.textContent = this.max !== undefined ? this.max : this.indeterminateText;
				if(this.textFormat === 'valueOnCircle') {
					this._positionValueText(angle, r);
				}
		}
	}


	/**
	 * Get circles' radius based on the calculated stroke widths of the value path and circle
	 * @return {number} The radius
	 */
	getRadius() {
		return 50 - Math.max(
			this._getStrokeWidth(this.graph.circle.el),
			this._getStrokeWidth(this.graph.sector.el),
		) / 2;
	}

	/**
	 * Get SVG element's stroke-width
	 */
	_getStrokeWidth(el) {
		return Number.parseFloat(this.ownerDocument.defaultView?.getComputedStyle(el)['stroke-width'] || 0);
	}
}


customElements.define('circle-progress', CircleProgress);

export default CircleProgress;

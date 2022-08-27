/**
 * @author Tigran Sargsyan <tigran.sn@gmail.com>
 */

import svgpaper from './svgpaper.js';
import animator, {
	easings,
} from './animator.js';
import util from './util.js';
import styles from './styles.js';


/**
 * Create a new Circle Progress bar
 * @global
 * @class Circle Progress class
 */
class CircleProgress extends HTMLElement {
	get value() {
		return this._attrs.value;
	}
	set value(val) {
		this.attr('value', val);
	}

	get min() {
		return this._attrs.min;
	}
	set min(val) {
		this.attr('min', val);
	}

	get max() {
		return this._attrs.max;
	}
	set max(val) {
		this.attr('max', val);
	}

	get startAngle() {
		return this._attrs.startAngle;
	}
	set startAngle(val) {
		this.attr('startAngle', val);
	}

	get anticlockwise() {
		return this._attrs.anticlockwise;
	}
	set anticlockwise(val) {
		this.attr('anticlockwise', val);
	}

	get unconstrained() {
		return this._attrs.unconstrained;
	}
	set unconstrained(val) {
		this.attr('unconstrained', val);
	}

	get indeterminateText() {
		return this._attrs.indeterminateText;
	}
	set indeterminateText(val) {
		this.attr('indeterminateText', val);
	}

	get textFormat() {
		return this._attrs.textFormat;
	}
	set textFormat(val) {
		this.attr('textFormat', val);
	}

	get animation() {
		return this._attrs.animation;
	}
	set animation(val) {
		this.attr('animation', val);
	}

	get animationDuration() {
		return this._attrs.animationDuration;
	}
	set animationDuration(val) {
		this.attr('animationDuration', val);
	}


	/**
	 * Construct the new CircleProgress instance
	 * @constructs
	 * @param {Object}                opts  Options
	 * @param {Document}              [doc] Document
	 */
	constructor(opts = {}, doc = document) {
		super();
		let circleThickness;

		opts = {...CircleProgress.defaults, ...opts};
		Object.defineProperty(this, '_attrs', {value: {}, enumerable: false});

		circleThickness = opts.textFormat === 'valueOnCircle' ? 16 : 8;

		const shadowRoot = this.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = styles;
		shadowRoot.append(style);

		this.graph = {
			paper: svgpaper(shadowRoot, 100, 100),
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
			d: CircleProgress._makeSectorPath(50, 50, 50 - circleThickness / 2, 0, 0),
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
		this._initText();
		['indeterminateText', 'textFormat', 'startAngle', 'anticlockwise', 'animation', 'animationDuration', 'unconstrained', 'min', 'max', 'value']
			.filter(key => key in opts)
			.forEach(key => this._set(key, opts[key]));
		this._updateGraph()
	}

	static get observedAttributes() {
		return [
			'value',
			'min',
			'max',
			'start-angle',
			'anticlockwise',
			'unconstrained',
			'indeterminate-text',
			'text-format',
			'animation',
			'animation-duration',
		]
	}

	static propAttrDict = {
		startAngle: 'start-angle',
		indeterminateText: 'indeterminate-text',
		textFormat: 'text-format',
		animationDuration: 'animation-duration',
	}

	/**
	 * Convert attribute name to property name
	 * @param {string} name Attribute name
	 * @return {string} Property name
	 */
	static attrToProp(name) {
		const pair = Object.entries(CircleProgress.propAttrDict).find(
			([_, attr]) => attr === name
		)
		return pair ? pair[0] : name
	}

	/**
	 * Convert attribute value to property value
	 * @param {string} name Attribute name
	 * @param {(string|null)} value Attribute value
	 * @return Property value
	 */
	static attrValToProp(name, value) {
		if (['anticlockwise', 'unconstrained'].includes(name)) {
			return value !== null
		}
		return value
	}

	/**
	 * Convert property name to attribute name
	 * @param {string} name Property name
	 * @return {string} Attribute name
	 */
	static propToAttr(name) {
		return CircleProgress.propAttrDict[name] ?? name
	}

	_bailOutAttrUpdate = false

	attributeChangedCallback(name, _, newValue) {
		if (this._bailOutAttrUpdate) {
			this._bailOutAttrUpdate = false
			return
		}
		this._set(CircleProgress.attrToProp(name), CircleProgress.attrValToProp(name, newValue))
		this._updateGraph()
	}

	reflectPropToAttribute(prop, value) {
		this._bailOutAttrUpdate = true
		const attr = CircleProgress.propToAttr(prop)
		if (['anticlockwise', 'unconstrained'].includes(prop)) {
			if (value) {
				this.setAttribute(attr, '')
			} else {
				this.removeAttribute(attr)
			}
		} else if (typeof value === 'function') {
			this.removeAttribute(attr)
		} else {
			this.setAttribute(attr, String(value))
		}
	}


	/**
	 * Set attributes
	 * @param  {(Array|Object)} attrs Attributes as an array [[key,value],...] or map {key: value,...}
	 * @return {CircleProgress}       The CircleProgress instance
	 */
	attr(attrs) {
		if(typeof attrs === 'string') {
			if(arguments.length === 1) return this._attrs[attrs];
			this._set(arguments[0], arguments[1]);
			this.reflectPropToAttribute(arguments[0], arguments[1])
			this._updateGraph();
			return this;
		} else if(typeof attrs !== 'object') {
			throw new TypeError(`Wrong argument passed to attr. Expected object, got "${typeof attrs}"`);
		}
		if(!Array.isArray(attrs)) {
			attrs = Object.keys(attrs).map(key => [key, attrs[key]]);
		}
		attrs.forEach(attr => {
			this._set(attr[0], attr[1])
			this.reflectPropToAttribute(attr[0], attr[1])
		});
		this._updateGraph();
		return this;
	}


	/**
	 * Set an attribute to a value
	 * @private
	 * @param {string} key Attribute name
	 * @param {*}      val Attribute value
	 */
	_set(key, val) {
		let ariaAttrs = {value: 'aria-valuenow', min: 'aria-valuemin', max: 'aria-valuemax'},
			circleThickness;

		val = this._formatValue(key, val);

		if(val === undefined) throw new TypeError(`Failed to set the ${key} property on CircleProgress: The provided value is non-finite.`);
		if(this._attrs[key] === val) return;
		if(key === 'min' && val >= this.max) return;
		if(key === 'max' && val <= this.min) return;
		if(key === 'value' && val !== undefined && !this.unconstrained) {
			if(this.min != null && val < this.min) val = this.min;
			if(this.max != null && val > this.max) val = this.max;
		}

		this._attrs[key] = val;

		if(key in ariaAttrs) {
			if(val !== undefined) this.graph.paper.svg.setAttribute(ariaAttrs[key], val);
			else this.graph.paper.svg.removeAttribute(ariaAttrs[key]);
		}
		if(['min', 'max', 'unconstrained'].indexOf(key) !== -1 && (this.value > this.max || this.value < this.min)) {
			this.value = Math.min(this.max, Math.max(this.min, this.value));
		}
		if(key === 'textFormat') {
			this._initText();
			circleThickness = val === 'valueOnCircle' ? 16 : 8;
			this.graph.sector.attr('stroke-width', circleThickness);
			this.graph.circle.attr('stroke-width', circleThickness);
		}
	}


	/**
	 * Format attribute value according to its type
	 * @private
	 * @param  {string} key Attribute name
	 * @param  {*}      val Attribute value
	 * @return {*}          Formatted attribute value
	 */
	_formatValue(key, val) {
		switch(key) {
			case 'value':
			case 'min':
			case 'max':
				val = Number.parseFloat(val);
				if(!isFinite(val)) val = undefined;
				break;
			case 'startAngle':
				val = Number.parseFloat(val);
				if(!isFinite(val)) val = undefined;
				else val = Math.max(0, Math.min(360, val));
				break;
			case 'anticlockwise':
			case 'unconstrained':
				val = !!val;
				break;
			case 'indeterminateText':
				val = '' + val;
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
	 * @private
	 * @return {float} Angle in degrees
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
	 * @private
	 * @return {bool} True if the state is indeterminate, false if it is determinate
	 */
	_isIndeterminate() {
		return !(typeof this.value === 'number' && typeof this.max === 'number' && typeof this.min === 'number');
	}


	/**
	 * Make sector path for use in the "d" path attribute
	 * @private
	 * @param  {float} cx         Center x
	 * @param  {float} cy         Center y
	 * @param  {float} r          Radius
	 * @param  {float} startAngle Start angle relative to straight upright axis
	 * @param  {float} angle      Angle to rotate relative to straight upright axis
	 * @param  {bool}  clockwise  Direction of rotation. Clockwise if truethy, anticlockwise if falsy
	 * @return {string}           Path string
	 */
	static _makeSectorPath(cx, cy, r, startAngle, angle, clockwise) {
		clockwise = !!clockwise;
		if(angle > 0 && angle < 0.3) {
			// Tiny angles smaller than ~0.3° can produce weird-looking paths
			angle = 0;
		} else if(angle > 359.999) {
			// If progress is full, notch it back a little, so the path doesn't become 0-length
			angle = 359.999
		}
		const endAngle = startAngle + angle * (clockwise * 2 - 1),
			startCoords = util.math.polarToCartesian(r, startAngle),
			endCoords = util.math.polarToCartesian(r, endAngle),
			x1 = cx + startCoords.x,
			x2 = cx + endCoords.x,
			y1 = cy + startCoords.y,
			y2 = cy + endCoords.y;

		return ["M", x1, y1, "A", r, r, 0, +(angle > 180), +clockwise, x2, y2].join(' ');
	}


	/**
	 * Position the value text on the circle
	 * @private
	 * @param  {float} angle Angle at which to position the text
	 * @param  {float} r Circle radius measured to the middle of the stroke
	 *                   as returned by {@link CircleProgress#_getRadius}, where text should be.
	 *                   The radius is passed rather than calculated inside the function
	 *                   for optimization purposes as this method is called from within an animation.
	 */
	_positionValueText(angle, r) {
		const coords = util.math.polarToCartesian(r, angle);
		this.graph.textVal.attr({x: 50 + coords.x, y: 50 + coords.y});
	}


	/**
	 * Generate text representation of the values based on {@link CircleProgress#textFormat}
	 * @private
	 * TODO: Remove offsets in em when support for IE is dropped
	 */
	_initText() {
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

	_animator = null


	/**
	 * Update graphics
	 * @private
	 */
	_updateGraph() {
		const startAngle = this.startAngle - 90;
		const r = this._getRadius();

		this._animator?.cancel()
		if(!this._isIndeterminate()) {
			const clockwise = !this.anticlockwise;
			let angle = this._valueToAngle();
			this.graph.circle.attr('r', r);
			if(this.animation !== 'none' && this.value !== this.graph.value) {
				this._animator = animator(this.animation, this.graph.value, this.value - this.graph.value, this.animationDuration, value => {
					this._updateText(Math.round(value), (2 * startAngle + angle) / 2, r);
					angle = this._valueToAngle(value);
					this.graph.sector.attr('d', CircleProgress._makeSectorPath(50, 50, r, startAngle, angle, clockwise));
				});
			} else {
				this.graph.sector.attr('d', CircleProgress._makeSectorPath(50, 50, r, startAngle, angle, clockwise));
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
			this._positionValueText(angle, r);
		}
	}


	/**
	 * Get circles' radius based on the calculated stroke widths of the value path and circle
	 * @private
	 * @return {float} The radius
	 */
	_getRadius() {
		return 50 - Math.max(
			Number.parseFloat(this.ownerDocument.defaultView.getComputedStyle(this.graph.circle.el, null)['stroke-width']),
			Number.parseFloat(this.ownerDocument.defaultView.getComputedStyle(this.graph.sector.el, null)['stroke-width']),
		) / 2;
	}
}

CircleProgress.defaults = {
	startAngle: 0,
	min: 0,
	max: 1,
	unconstrained: false,
	indeterminateText: '?',
	anticlockwise: false,
	textFormat: 'horizontal',
	animation: 'easeInOutCubic',
	animationDuration: 600
};


customElements.define('circle-progress', CircleProgress);

export default CircleProgress;

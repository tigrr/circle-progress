'use strict';

var svgpaper = (function() {

var paper,
	paperproto,
	element,
	elementproto;


/**
 * Create new paper holding a new SVG element
 * @param  {(HTMLElement|string)} container      Container element or selector string
 * @param  {(number|string)}      width          SVG width
 * @param  {(number|string)}      height         SVG height
 * @param  {Document}             [doc=document] HTML document. Defaults to current document
 * @return {Object}                              The paper
 */
paper = function(container, width, height, doc) {
	var svg, me;

	doc = doc || document;

	me = Object.create(paperproto);

	if(typeof container === 'string') container = doc.querySelector(container);

	if(!container) return;

	svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('version', '1.1');
	if(width) svg.setAttribute('width', width);
	if(height) svg.setAttribute('height', height);
	if(width && height) svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
	container.appendChild(svg);

	me.svg = svg;
	return me;
};

paperproto = {
	/**
	 * Create a new SVG element
	 * @param  {string}     name      Element name
	 * @param  {Object}     attrs     Map of attributes
	 * @param  {string}     content   Element content
	 * @param  {SVGElement} [parent]  An element to append to. Defaults to the root SVG element
	 * @return {object}               Element
	 */
	element: function(name, attrs, content, parent) {
		var el;

		el = element(this, name, attrs, parent);
		if(content) el.el.innerHTML = content;
		
		return el;
	},
	/**
	 * Create an element by name (shortcut)
	 * @param  {string} name Element name
	 * @param  {Array}  args Array (or array-like object) of arguments required by the shape
	 * @return {Object}      Element
	 */
	_shortcutElement: function(name, args) {
		var attrNames, attrs = {}, content;

		switch(name) {
		case 'rect':
			attrNames = ['x', 'y', 'width', 'height', 'r'];
			break;
		case 'circle':
			attrNames = ['cx', 'cy', 'r'];
			break;
		case 'path':
			attrNames = ['d'];
			break;
		case 'text':
			attrNames = ['x', 'y'];
			content = args[3];
			break;
		}

		if(attrNames.length !== args.length) throw new Error('Unexpected number of arguments to ' + name + '. Expected ' + attrNames.length + ' arguments, got ' + args.length);
		attrNames.forEach(function(key) {
			attrs[key] = args[key];
		});

		return this.element.apply(this, [name, attrs, content]);
	},
	/**
	 * Create rectangle
	 * @return {object} Element
	 */
	rect: function() {
		return this._shortcutElement('rect', arguments);
	},
	/**
	 * Create circle
	 * @return {object} Element
	 */
	circle: function() {
		return this._shortcutElement('circle', arguments);
	},
	/**
	 * Create path element
	 * @return {object} Element
	 */
	path: function() {
		return this._shortcutElement('path', arguments);
	}
};

/**
 * General purpose element maker
 * @param  {Object}     paper    SVG Paper
 * @param  {string}     name     Element tag name
 * @param  {Object}     attrs    Attributes for the element
 * @param  {SVGElement} [parent] Another SVG Element to append the
 * @param  {Document}   [doc]    Document
 * @return {Object}              Element
 */
element = function(paper, name, attrs, parent, doc) {
	var attrNames, me;

	doc = doc || document;

	me = Object.create(elementproto);

	me.el = doc.createElementNS('http://www.w3.org/2000/svg', name);
	me.attr(attrs);

	(parent ? parent.el || parent : paper.svg).appendChild(me.el);

	return me;
};

elementproto = {
	/**
	 * Set an attribute to a value
	 * @param  {string} name  Attribute name
	 * @param  {*}      value Attribute value
	 * @return {object}       The element
	 * *//**
	 * Set attributes
	 * @param {object} attrs  Map of name - values
	 * @return {object}       The element
	 */
	attr: function(name, value) {
		if(name === undefined) return this;
		if(typeof name === 'object') {
			for(var key in name) {
				this.attr(key, name[key]);
			}
			return this;
		}
		if(value === undefined)
			return this.el.getAttributeNS(null, name);
		this.el.setAttribute(name, value);
		return this;
	},
	/**
	 * Set content (innerHTML) for the element
	 * @param  {string} content String of SVG
	 * @return {object}         The element
	 */
	content: function(content) {
		this.el.innerHTML = content;
		return this;
	}
};


// Export paper.
return paper;

}());

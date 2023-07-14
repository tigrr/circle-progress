export default class CustomElement extends HTMLElement {
	static styles = ''
	static props = {}

	// A map of property names to attribute names
	#propToAttrDict = {}
	// A map of attribute names to property names
	#attrToPropDict = {}

	#boolProps = new Set()

	constructor() {
		super()
		const shadowRoot = this.attachShadow({ mode: 'open' })

		// @ts-ignore
		const {styles} = this.constructor
		if (styles) {
			const style = document.createElement('style')
			style.textContent = styles
			shadowRoot.append(style)
		}

		// @ts-ignore
		const {props} = this.constructor
		if (props) {
			for (const [prop, config] of Object.entries(props)) {
				if (config.attribute) {
					this.#propToAttrDict[prop] = config.attribute
					this.#attrToPropDict[config.attribute] = prop
				}
				if (config.type === Boolean) {
					this.#boolProps.add(prop)
				}
			}
		}
	}

	/**
	 * Update the element with a new property and value.
	 * @param {string} prop - The name of the property to update.
	 * @param {*} value - The new value for the property.
	 * @return {void}
	 */
	// @ts-ignore
	update(prop, value) {}

	/**
	 * Convert attribute name to property name
	 * @param {string} name Attribute name
	 * @return {string} Property name
	 */
	#attrNameToProp(name) {
		return this.#attrToPropDict[name] ?? name
	}

	/**
	 * Convert property name to attribute name
	 * @param {string} name Property name
	 * @return {string} Attribute name
	 */
	#propToAttrName(name) {
		return this.#propToAttrDict[name] ?? name
	}

	/**
	 * Convert attribute value to property value
	 * @param {string} name Attribute name
	 * @param {(string|null)} value Attribute value
	 * @return Property value
	 */
	#attrValToProp(name, value) {
		if (this.#boolProps.has(name)) {
			return value !== null
		}
		return value
	}

	#bailOutAttrUpdate = false

	attributeChangedCallback(name, _, newValue) {
		if (this.#bailOutAttrUpdate) {
			this.#bailOutAttrUpdate = false
			return
		}
		this.update?.(this.#attrNameToProp(name), this.#attrValToProp(name, newValue))
	}

	reflectPropToAttribute(prop, value) {
		this.#bailOutAttrUpdate = true
		const attr = this.#propToAttrName(prop)
		if (this.#boolProps.has(prop)) {
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
}

import {expect} from '@esm-bundle/chai'
import '../src/circle-progress.js'

/**
 * Wait for a number of milliseconds
 */
const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get SVG text content of a Circle Progress element
 */
const getText = (cp) => cp.shadowRoot.querySelector('.text').textContent

describe('Circle Progress', function() {
	const cp = /** @type {import('../src/circle-progress').default} */ (document.createElement('circle-progress'))
	cp.style.marginBottom = '30px'
	document.body.appendChild(cp)

	beforeEach(() => {
		cp.min = -1000
		cp.max = 1000
		cp.unconstrained = false
		cp.animation = 'none'
	})

	it('should add aria- properties on the first element in the shadow root', async function() {
		cp.min = -1
		cp.max = 9
		cp.value = 5.3
		await this.updateComplete
		expect(cp.shadowRoot?.querySelector('.base')?.getAttribute('aria-valuemin')).to.equal('-1')
		expect(cp.shadowRoot?.querySelector('.base')?.getAttribute('aria-valuemax')).to.equal('9')
		expect(cp.shadowRoot?.querySelector('.base')?.getAttribute('aria-valuenow')).to.equal('5.3')
	})

	it('sets value', function() {
		cp.min = 0
		cp.max = 10
		cp.value = 5
		expect(cp.value).to.equal(5)
		// @ts-ignore
		cp.value = '6'
		expect(cp.value).to.equal(6)
	})

	it('sets min', function() {
		cp.max = 10
		cp.min = 1
		expect(cp.min).to.equal(1)
		// @ts-ignore
		cp.min = '2'
		expect(cp.min).to.equal(2)
	})

	it('sets max', function() {
		cp.min = 1
		cp.max = 9
		expect(cp.max).to.equal(9)
		// @ts-ignore
		cp.max = '10'
		expect(cp.max).to.equal(10)
	})

	it('should update the constrains when setting min / max and value together', function() {
		cp.min = 0
		cp.max = 1
		cp.value = 5
		cp.max = 10
		expect(cp.value).to.equal(5)
		expect(cp.max).to.equal(10)
	})

	it('can set negative min and max and constrain value between them', function() {
		cp.min = -10
		cp.max = 0
		expect(cp.min).to.equal(-10)
		expect(cp.max).to.equal(0)
		cp.max = -11
		expect(cp.max).to.equal(-10)
		cp.max = 0
		cp.value = -11
		expect(cp.value).to.equal(-10)
		cp.value = 1
		expect(cp.value).to.equal(0)
	})

	it('should constrain min if it is greater than max and max if it is less than min', function() {
		cp.min = 11
		cp.max = 10
		expect(cp.min).to.equal(10)
		cp.max = 1
		expect(cp.max).to.equal(10)
	})

	it('sets constrain', function() {
		cp.unconstrained = true
		expect(cp.unconstrained).to.equal(true)
		cp.unconstrained = false
		expect(cp.unconstrained).to.equal(false)
	})

	it('can constrain value between min and max', function() {
		cp.unconstrained = false
		cp.min = 2
		cp.max = 10
		cp.value = -2
		expect(cp.value).to.equal(2)
		cp.value = 20
		expect(cp.value).to.equal(10)
		cp.max = 8
		expect(cp.value).to.equal(8)
		cp.value = 3
		cp.min = 4
		expect(cp.value).to.equal(4)
	})

	it('can extend value outside min and max, if unconstrained is set to true', function() {
		cp.unconstrained = true
		cp.min = 2
		cp.max = 10
		cp.value = -2
		expect(cp.value).to.equal(-2)
		cp.value = 20
		expect(cp.value).to.equal(20)
	})

	it('sets start angle', function() {
		cp.startAngle = 45
		expect(cp.startAngle).to.equal(45)
		// @ts-ignore
		cp.startAngle = '90'
		expect(cp.startAngle).to.equal(90)
	})

	it('should constrain start angle between 0 and 360', function() {
		cp.startAngle = -30
		expect(cp.startAngle).to.equal(0)
		cp.startAngle = 400
		expect(cp.startAngle).to.equal(360)
	})

	it('can use attr method to set and retrieve properties', function() {
		cp.attr('min', '0')
		cp.attr('max', '10')
		expect(cp.max).to.equal(10)
		expect(cp.attr('max')).to.equal(10)
		cp.attr('value', '7')
		expect(cp.value).to.equal(7)
		cp.attr({min: 1, value: '8'})
		expect(cp.attr('min')).to.equal(1)
		expect(cp.attr('value')).to.equal(8)
	})

	it('should accept decimal values', function() {
		cp.min = -2.7
		cp.max = 1.8
		cp.value = 0.5
		expect(cp.min).to.equal(-2.7)
		expect(cp.max).to.equal(1.8)
		expect(cp.value).to.equal(0.5)
	})

	it('should reflect decimal values in text both when animation is on and off', async function() {
		cp.textFormat = 'value'
		cp.value = 0.6
		await this.updateComplete
		expect(+getText(cp)).to.equal(0.6)
		cp.animation = 'easeInOutCubic'
		cp.value = 0.7
		await waitFor(700)
		expect(+getText(cp)).to.equal(0.7)
	})

	it('goes clockwise and anticlockwise', async function() {
		cp.anticlockwise = true
		await this.updateComplete
		expect(cp.shadowRoot?.querySelector('.value')?.getAttribute('d')).to.match(/^M (?:[\d.]+ ){2}A (?:[\d.]+ ){4}0/)
		cp.anticlockwise = false
		await this.updateComplete
		expect(cp.shadowRoot?.querySelector('.value')?.getAttribute('d')).to.match(/^M (?:[\d.]+ ){2}A (?:[\d.]+ ){4}1/)
	})

	it('should throw error if value, min, max, startAngle is a string that cannot be converted to a number', function() {
		// @ts-ignore
		expect(() => cp.value = 'a').to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.value = '1.5e2B').to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.min = 'a').to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.max = 'a').to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.startAngle = 'a').to.throw(Error, 'The provided value is non-finite')
	})

	it('should throw error if value, min, max, startAngle is a NaN', function() {
		// @ts-ignore
		expect(() => cp.value = NaN).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.min = NaN).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.max = NaN).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.startAngle = NaN).to.throw(Error, 'The provided value is non-finite')
	})

	it('should throw error if value, min, max, startAngle is positive or negative Infinity', function() {
		// @ts-ignore
		expect(() => cp.value = Infinity).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.min = Infinity).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.max = Infinity).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.value = -Infinity).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.startAngle = -Infinity).to.throw(Error, 'The provided value is non-finite')
	})

	it('should throw error if value, min, max, startAngle is undefined', function() {
		// @ts-ignore
		expect(() => cp.value = undefined).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.min = undefined).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.max = undefined).to.throw(Error, 'The provided value is non-finite')
		// @ts-ignore
		expect(() => cp.startAngle = undefined).to.throw(Error, 'The provided value is non-finite')
	})

	it('should accept string values that can be converted to numbers for value, min, max, startAngle', function() {
		// @ts-ignore
		cp.min = '-2'
		// @ts-ignore
		cp.max = '1000.65'
		// @ts-ignore
		cp.value = '1'
		// @ts-ignore
		cp.startAngle = '90'
		expect(cp.min).to.equal(-2)
		expect(cp.max).to.equal(1000.65)
		expect(cp.value).to.equal(1)
		expect(cp.startAngle).to.equal(90)
		// @ts-ignore
		cp.value = true
		expect(cp.value).to.equal(1)
		// @ts-ignore
		cp.value = false
		expect(cp.value).to.equal(0)
		// @ts-ignore
		cp.value = '1.5e2'
		expect(cp.value).to.equal(150)
		// @ts-ignore
		cp.value = '0x10'
		expect(cp.value).to.equal(16)
		// @ts-ignore
		cp.value = '0b10'
		expect(cp.value).to.equal(2)
		// @ts-ignore
		cp.value = '0o10'
		expect(cp.value).to.equal(8)
		// @ts-ignore
		cp.value = '0'
		expect(cp.value).to.equal(0)
		// @ts-ignore
		cp.value = '0.0'
		expect(cp.value).to.equal(0)
	})

	it('should convert null to 0 for value, min, max, startAngle', function() {
		cp.value = 1
		// @ts-ignore
		cp.value = null
		expect(cp.value).to.equal(0)
		// @ts-ignore
		cp.min = null
		expect(cp.min).to.equal(0)
		// min must be below in order for max = 0 to be accepted
		cp.min = -1
		// @ts-ignore
		cp.max = null
		expect(cp.max).to.equal(0)
	})

	it('should update properties when attributes change', function() {
		cp.setAttribute('min', '0')
		cp.setAttribute('max', '10')
		cp.setAttribute('value', '5')
		cp.setAttribute('unconstrained', '')
		expect(cp.min).to.equal(0)
		expect(cp.max).to.equal(10)
		expect(cp.value).to.equal(5)
		expect(cp.unconstrained).to.equal(true)
	})

	it('should update attributes when properties change', function() {
		cp.min = 0
		cp.max = 10
		cp.value = 5
		cp.unconstrained = true
		expect(cp.getAttribute('min')).to.equal('0')
		expect(cp.getAttribute('max')).to.equal('10')
		expect(cp.getAttribute('value')).to.equal('5')
		expect(cp.getAttribute('unconstrained')).to.equal('')
	})

	it('should animate text when value changes when animation is on', async function() {
		cp.animation = 'none'
		cp.value = 0
		cp.animation = 'linear'
		cp.textFormat = 'value'
		cp.value = 10
		await waitFor(100)
		expect(+getText(cp)).to.be.above(0).and.below(10)
	})

	it('should jump straight to the updated value when animation is off', async function() {
		cp.animation = 'none'
		cp.value = 0
		cp.value = 10
		await waitFor(100)
		expect(+getText(cp)).to.equal(10)
	})

	it('should animate for the number of milliseconds specified in animationDuration', async function() {
		cp.animation = 'none'
		cp.value = 0
		await cp.updateComplete
		cp.animation = 'linear'
		cp.animationDuration = 1000
		cp.value = 10
		await waitFor(100)
		expect(+getText(cp)).to.be.within(0, 2)
		await waitFor(800)
		expect(+getText(cp)).to.be.within(8, 10)
		await waitFor(200)
		expect(+getText(cp)).to.equal(10)
	})

	it('should display indeterminateText as value text when in indeterminate state', async function() {
		const cp = /** @type {import('../src/circle-progress').default} */ (document.createElement('circle-progress'))
		cp.textFormat = 'value'
		cp.indeterminateText = '#%'
		await this.updateComplete
		expect(getText(cp)).to.equal('#%')
	})
})

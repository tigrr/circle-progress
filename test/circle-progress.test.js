import { expect } from '@esm-bundle/chai';
import '../src/circle-progress.js';

describe('Circle Progress', function() {
	const cp = document.createElement('circle-progress');
	cp.style.marginBottom = '30px';
	document.body.appendChild(cp);

	beforeEach(() => {
		cp.min = -1000;
		cp.max = 1000;
		cp.constrain = false;
	});

	it('sets value', function() {
		cp.min = 0;
		cp.max = 10;
		cp.value = 5;
		expect(cp.value).to.equal(5);
		cp.value = '6';
		expect(cp.value).to.equal(6);
	});

	it('sets min', function() {
		cp.max = 10;
		cp.min = 1;
		expect(cp.min).to.equal(1);
		cp.min = '2';
		expect(cp.min).to.equal(2);
	});

	it('sets max', function() {
		cp.min = 1;
		cp.max = 9;
		expect(cp.max).to.equal(9);
		cp.max = '10';
		expect(cp.max).to.equal(10);
	});

	it('can set negative min and max and constrain value between them', function() {
		cp.min = -10;
		cp.max = 0;
		expect(cp.min).to.equal(-10);
		expect(cp.max).to.equal(0);
		cp.max = -11;
		expect(cp.max).to.equal(0);
		cp.constrain = true;
		cp.value = -11;
		expect(cp.value).to.equal(-10);
		cp.value = 1;
		expect(cp.value).to.equal(0);
	});

	it('does not accept min greater than max and max less than min', function() {
		cp.min = 2;
		cp.max = 10;
		cp.min = 11;
		expect(cp.min).to.equal(2);
		cp.max = 1;
		expect(cp.max).to.equal(10);
	});

	it('sets constrain', function() {
		cp.unconstrained = true;
		expect(cp.unconstrained).to.equal(true);
		cp.unconstrained = false;
		expect(cp.unconstrained).to.equal(false);
	});

	it('can constrain value between min and max', function() {
		cp.unconstrained = false;
		cp.min = 2;
		cp.max = 10;
		cp.value = -2;
		expect(cp.value).to.equal(2);
		cp.value = 20;
		expect(cp.value).to.equal(10);
		cp.max = 8;
		expect(cp.value).to.equal(8);
		cp.value = 3;
		cp.min = 4;
		expect(cp.value).to.equal(4);
	});

	it('can extend value outside min and max, if unconstrained is set to true', function() {
		cp.unconstrained = true;
		cp.min = 2;
		cp.max = 10;
		cp.value = -2;
		expect(cp.value).to.equal(-2);
		cp.value = 20;
		expect(cp.value).to.equal(20);
	});

	it('sets start angle', function() {
		cp.startAngle = 45;
		expect(cp.startAngle).to.equal(45);
		cp.startAngle = '90';
		expect(cp.startAngle).to.equal(90);
	});

	it('should constrain start angle between 0 and 360', function() {
		cp.startAngle = -30;
		expect(cp.startAngle).to.equal(0);
		cp.startAngle = 400;
		expect(cp.startAngle).to.equal(360);
	});

	it('uses attr method to set and retrieve properties', function() {
		cp.attr('min', '0');
		cp.attr('max', '10');
		expect(cp.max).to.equal(10);
		expect(cp.attr('max')).to.equal(10);
		cp.attr('value', '7');
		expect(cp.value).to.equal(7);
		cp.attr({min: 1, value: '8'});
		expect(cp.attr('min')).to.equal(1);
		expect(cp.attr('value')).to.equal(8);
	});

	// it('goes clockwise and anticlockwise', function() {
	// 	cp.clockwise = true;
	// 	expect()
	// });
});

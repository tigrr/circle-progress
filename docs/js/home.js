'use strict';

function init() {
	const introEl = document.querySelector('.intro');
	const cp = document.querySelector('.intro-progress');

	cp.graph.paper.svg.setAttribute('viewBox', '-10 -10 120 120');

	// We have to inject keyframes into shadow dom of the element,
	// otherwise animations don't work.
	// Chromium bug: https://bugs.chromium.org/p/chromium/issues/detail?id=838526#c18
	// Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1458189
	const keyframeNames = [
		'dots',
		'grow-value',
		'value-4',
		'grow-circle',
		'grow-xxl-value',
		'grow-xxl-circle',
	];
	[...document.styleSheets[1].cssRules]
		.filter(
			rule =>
				rule.constructor.name === 'CSSKeyframesRule' &&
				keyframeNames.includes(rule.name)
			)
		.map(rule => cp.shadowRoot.styleSheets[0].insertRule(rule.cssText));


	setTimeout(function() {
		introEl.dataset.demo = 'responsive';
	}, 3000);

	setTimeout(function() {
		introEl.dataset.demo = 'animated';
		setTimeout(function() {
			cp.value = 90;
			setTimeout(function() {
				cp.value = 20;
			}, 800);
			setTimeout(function() {
				cp.value = 60;
			}, 1600);
		}, 700);
	}, 5700);

	setTimeout(function() {
		introEl.dataset.demo = 'stylable';
		let i = 0;
		const interv = setInterval(function() {
			i += 1;
			if(i === 6) {
				clearInterval(interv);
				return;
			}
			cp.dataset.style = i;
			if(i === 5) {
				updateGraph();
				setTimeout(function() {
					introEl.dataset.demo = 'accessible';
				}, 700);
			}
		}, 1600);

		function updateGraph() {
			cp._updateGraph();
			if(i < 6) {
				requestAnimationFrame(updateGraph);
			}
		}
	}, 8500);

	setTimeout(function() {
		introEl.dataset.demo = 'finished';
	}, 19000);
}

window.customElements.whenDefined('circle-progress').then(init)

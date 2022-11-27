'use strict';


// Examples
const exampleCodeTemplate = document.querySelector('#example-code-block-template')
const exampleControlsTemplate = document.querySelector('#example-controls-template')

;[...document.querySelectorAll('.example')].forEach(function(exampleEl, i) {
	const cp = exampleEl.querySelector('.progress')

	if (i === 6) {
		cp.textFormat = function(value) {
			return value + ' dots';
		}
	}


	const exampleBlock = exampleCodeTemplate.content.cloneNode(true)

	const cpText = cp.outerHTML
		.replace(/\s*class="progress"\s*/, ' ')
		.replace(/=""/g, '')
		.replace(/ /g, '\n\t')
		.replace(/></g, '\n$&')
	exampleBlock.querySelector('.code.html').innerText = cpText

	const style = exampleEl.querySelector('style')
	exampleBlock.querySelector('.code.css').textContent =
		style.textContent
			.trim()
			.replace(/\n\t{4}/g, '\n') ||
		'\n\n\n'
	style.textContent = style.textContent.replace(/circle-progress/g, `.example:nth-of-type(${i + 1}) $&`)

	exampleEl.querySelector('.example-figure').after(exampleBlock)


	const controls = exampleControlsTemplate.content.cloneNode(true)
	controls.querySelector('[name=value]').value = cp.getAttribute('value')
	controls.querySelector('[name=max]').value = cp.getAttribute('max')
	exampleEl.querySelector('.example-figure').append(controls)

	exampleEl.querySelector('.controls').addEventListener('change', function(e) {
		if(e.target.nodeName !== 'INPUT') return;
		const key = e.target.name;
		cp[key] = e.target.value;
		[...exampleEl.querySelectorAll('.controls input')].forEach(function(input) {
			input.value = cp[input.name];
		});
	});
});

[...document.querySelectorAll('.code')].forEach(function(el) {
	el.addEventListener('click', function() {
		var r = document.createRange();
		r.selectNode(this);
		var s = document.getSelection();
		s.empty();
		s.addRange(r);
	});
});


hljs.initHighlightingOnLoad();

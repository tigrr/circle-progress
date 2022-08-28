'use strict';


// Examples
[...document.querySelectorAll('.example')].forEach(function(exampleEl, i) {
	const cp = exampleEl.querySelector('.progress')
	if (i === 6) {
		cp.textFormat = function(value, max) {
			return value + ' dots';
		}
	}
	// $(exampleEl.querySelector('.progress')).circleProgress(opts);
	const exampleCodeBlock = exampleEl.querySelector('.example-code-block')
	exampleCodeBlock.innerHTML = `
		<h3>
			<a class="select-variant" href="#vanilla" data-variant="vanilla">HTML</a>
			<span class="slash"> / </span>
			<a class="select-variant" href="#jquery" data-variant="jquery">jQuery</a>
		</h3>
		<pre class="variant-vanilla"><code class="code html"></code></pre>
		<pre class="variant-jquery"><code class="code js"></code></pre>
		<h3>CSS</h3>
		<pre><code class="code css"></code></pre>
	`
	const cpText = cp.outerHTML
		.replace(/\s*class="progress"\s*/, ' ')
		.replace(/=""/g, '')
		.replace(/ /g, '\n\t')
		.replace(/></g, '\n$&')
	exampleEl.querySelector('.variant-vanilla code').innerText = cpText
	// exampleEl.querySelector('.variant-jquery code').innerText = '$(\'.progress\').circleProgress(' + optsStr + ');';
	const style = exampleEl.querySelector('style')
	const styleText = style.textContent.trim().replace(/\n\t{4}/g, '\n')
	exampleEl.querySelector('.code.css').textContent = styleText || '\n\n\n'
	style.textContent = style.textContent.replace(/circle-progress/g, `.example:nth-of-type(${i + 1}) $&`)
	exampleEl.querySelector('.example-figure').insertAdjacentHTML('beforeend', '<div class="controls">' +
		'<label><input type="number" name="min" value="0">min</label>' +
		'<label><input type="number" name="value" value="' + cp.getAttribute('value') + '">value</label>' +
		'<label><input type="number" name="max" value="' + cp.getAttribute('max') + '">max</label>' +
	'</div>');

	[...exampleEl.querySelectorAll('.select-variant')].forEach(el =>
		el.addEventListener('click', function(e) {
			e.preventDefault();
			if(el.dataset.variant === 'vanilla') {
				document.body.classList.remove('show-variant-jquery');
				document.body.classList.add('show-variant-vanilla');
			} else {
				document.body.classList.remove('show-variant-vanilla');
				document.body.classList.add('show-variant-jquery');
			}
		})
	)

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

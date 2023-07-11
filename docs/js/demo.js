// Examples
/**
 * @type {HTMLTemplateElement|null}
 */
const exampleCodeTemplate = document.querySelector('#example-code-block-template')
/**
 * @type {HTMLTemplateElement|null}
 */
const exampleControlsTemplate = document.querySelector('#example-controls-template')

if (!exampleCodeTemplate || !exampleControlsTemplate) {
	throw new Error('Some example code templates are missing')
}

;[...document.querySelectorAll('.example')].forEach(function(exampleEl, i) {
	/**
	 * @type {import('../../src/circle-progress').default|null}
	 */
	const cp = exampleEl.querySelector('.progress')

	if (!cp) {
		throw new Error('No .progress element found in example')
	}

	if (i === 6) {
		cp.textFormat = function(value) {
			return value + ' dots'
		}
	}


	const exampleBlock = /** @type {DocumentFragment} */ (exampleCodeTemplate.content.cloneNode(true))

	const cpText = cp.outerHTML
		.replace(/\s*class="progress"\s*/, ' ')
		.replace(/=""/g, '')
		.replace(/ /g, '\n\t')
		.replace(/></g, '\n$&')
	exampleBlock.querySelector('.code.html').textContent = cpText

	const style = exampleEl.querySelector('style')
	exampleBlock.querySelector('.code.css').textContent =
		style.textContent
			.trim()
			.replace(/\n\t{4}/g, '\n') ||
		'\n\n\n'
	style.textContent = style.textContent.replace(/circle-progress/g, `.example:nth-of-type(${i + 1}) $&`)

	exampleEl.querySelector('.example-figure').after(exampleBlock)


	const controls = /** @type {DocumentFragment} */ (exampleControlsTemplate.content.cloneNode(true))
	;/** @type {HTMLInputElement} */ (controls.querySelector('[name=value]')).value = cp.getAttribute('value')
	;/** @type {HTMLInputElement} */ (controls.querySelector('[name=max]')).value = cp.getAttribute('max')
	exampleEl.querySelector('.example-figure').append(controls)

	exampleEl.querySelector('.controls').addEventListener(
		'change',
		/**
		 * @param {Event} e
		 */
		function(e) {
			const control = /** @type {HTMLInputElement} */ (e.target)
			if(control.nodeName !== 'INPUT') {
				return
			}
			cp[control.name] = control.value
			;(/** @type {HTMLInputElement[]} */ ([...exampleEl.querySelectorAll('.controls input')])).forEach(function(input) {
				input.value = cp[input.name]
			})
		}
	)

	// Make sure demo is loaded before custom elements have been defined and upgraded,
	// since we want the raw html from circle-progress before any properties have been reflected to attributes
	// @ts-ignore
	import('https://cdn.jsdelivr.net/npm/js-circle-progress/dist/circle-progress.min.js')

})

;[...document.querySelectorAll('.copy-code-btn')].forEach(function(el) {
	el.addEventListener('click', function() {
		const code = this.closest('.code-container').querySelector('.code').textContent
		navigator.clipboard.writeText(code)
	})
})


// @ts-ignore
hljs.initHighlightingOnLoad()

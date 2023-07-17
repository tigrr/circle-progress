export default /* css */`
	:host(:not([hidden])) {
		display: inline-block;
	}

	.circle {
		fill: none;
		stroke: #ddd;
	}

	.value {
		fill: none;
		stroke: #00E699;
	}

	.text {
		font: 16px Arial, sans-serif;
		text-anchor: middle;
		fill: #999;
	}

	:host([text-format="valueOnCircle"]) .text-value {
		font-size: 12px;
		fill: #fff;
	}

	:host([text-format="valueOnCircle"]) .text-max {
		font-size: 22px;
		font-weight: bold;
		fill: #ddd;
	}

	:host([text-format="vertical"]) .text-separator {
		font-family: Arial, sans-serif !important;
	}
`

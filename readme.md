# Circle Progress

> Lightweight (less than 4kB minified and gzipped), responsive, accessible, animated, stylable with CSS circular progress bar web component.

![](https://i.imgur.com/gpxlBmm.png)

See [examples][examples] or go to the [project site][site]

## Circle Progress v1 is out! 🚀

There's been a major rewrite of Circle Progress. The new version is a [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) (custom element), which can be used directly in HTML just like any native element. It can also be used programmatically in JavaScript.

The new version is not entirely backwards compatible with the old one. If you need the old version, you can still find it in the [v0 branch](https://github.com/tigrr/circle-progress/tree/v0).

This version is currently in beta. Any feedback is much appreciated.

### Breaking changes since v0

*New users — skip to [Getting Started](#getting-started) section below.*

- Internet Explorer and Safari below version 14 are no longer supported.
- The jQuery variant of the library is no longer provided.
- The library is only shipped as an ES module.
- The `clockwise` and `constrain` properties have been revised to `anticlockwise` and `unconstrained` correspondingly, which have the opposite meanings and are both `false` by default.
- Rather than using classes to style elements inside Circle Progress, such as `.circle-progress-circle`, `.circle-progress-value`, `.circle-progress-text`, you can now use the [`::part()` CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/::part), e. g. `circle-progress::part(circle)`, `circle-progress::part(value)`, `circle-progress::part(text)`. See [Styling](#styling) section below or check the [examples][examples] for details.
- When passing a string for value, min, max or startAngle, it is now converted to number with rather than parse as float. This means you cannot pass it strings that have anything other than valid number characters. On the other hand strings which have numbers represented in any type of notation, such as scientific `1.2e7`, hexadecimal (0x1b4) or octal (0o10) are now properly converted. When making a property assignment (not attribute) you are advised to always pass numbers as numbers, not strings.
- All consequent property updates are batched together and applied at once, whether set through the `attr` method or as property assignments. This means that if you set multiple properties at once, the constraints (such as keeping `value` between `min` and `max`) will be applied on the new values and the component will only be updated once, which is more efficient. Once you set the properties, you can subscribe to the update if you need by awaiting the `circleProgress.updateComplete` Promise.

What hasn't changed?
- All the public properties and methods are the same (except for those mentioned above).
- The look and behavior of the component hasn't changed.
- You can still use `CircleProgress` programmatically in JavaScript in the same way as before.

Keep on reading for more details.


## Getting Started

### Using npm

Navigate to your project directory and install the `js-circle-progress` module:
```shell
$ npm install --save js-circle-progress
```

Import the module anywhere in your application:
```js
import 'js-circle-progress'
```

This will register the `circle-progress` custom element, which you can use in your html:
```html
<circle-progress value="50" max="100"></circle-progress>
```

Alternatively, you can import the module in your JavaScript and use it programmatically:

```js
import 'js-circle-progress'

// Create an instance of CircleProgress element
const cp = document.createElement('circle-progress')
```

or

```js
import CircleProgress from 'js-circle-progress'

// Create an instance of CircleProgress element
const cp = new CircleProgress()
```

Either way you get the same `CircleProgress` element.

### Manually downloading the script

Download the minified [production version][vanilla-min]

Given you placed the downloaded file in the same folder as your HTML file, in your HTML:
```html
<script src="circle-progress.min.js" type="module"></script>

<circle-progress value="50" max="100"></circle-progress>
```

### Using a CDN

In your HTML:
```html
<script src="https://unpkg.com/js-circle-progress/dist/circle-progress.min.js" type="module"></script>

<circle-progress value="50" max="100"></circle-progress>
```

**Important! The script is an ES module, so you need to include it with the `type="module"` attribute.**


## Usage

### Properties
There are multiple ways to set properties on Circle Progress.

Set properties on a `CircleProgress` instance:
```js
circleProgress.max = 100;
circleProgress.value = 20;
```

or using the chainable `attr` method by passing it property key and value:

```js
circleProgress
	.attr('max', 100)
	.attr('value', 20);
```

or options object

```js
circleProgress.attr({
	max: 100,
	value: 20,
});
```

When using the constructor, you can pass it options object directly at initialization:

```js
const cp = new CircleProgress({
  value: 50,
  max: 100,
})
```

#### All available properties

| Option            | Type    | Default  | Description |
| ----------------- | ------- | -------- | ----------- |
| value             | Number  | Indeterminate | Current value |
| min               | Number  | 0        | Minimum value |
| max               | Number  | 1        | Maximum value |
| startAngle        | Number  | 0        | Starting angle in degrees. Angle of 0 points straight up. Direction depends on `anticlockwise`. |
| anticlockwise     | Boolean | false    | Whether to rotate anti-clockwise (true) or clockwise (false) |
| unconstrained     | Boolean | false    | Whether the value should be constrained between `min` and `max`. If false, values over `max` will be truncated to `max` and values under `min` will be set to `min`. |
| indeterminateText | String | '?' | Text to display as the value when it is indeterminate |
| textFormat | String or Function | 'horizontal' | Text layout for value, min, max. <br> You can pass either one of the possible keywords: <br> `horizontal` - <samp>value/max</samp> <br> `vertical` - value is shown over max <br> `percent` - <samp>value%</samp> <br> `value` - only value is shown <br> `valueOnCircle` - the value is painted on top of the filled region on the circle <br> `none` - no text is shown. <br>Alternatively you can provide your own function, which will be called each time progress is updated with value and max as arguments, and is expected to return a string of HTML to insert in the center of the progress circle. **Attention! The string returned from your function will be inserted as HTML. Do not pass any dynamic content such as variables coming from elsewhere to avoid XSS vulnerability.** |
| animation  | String or Function | 'easeInOutCubic' | Animation easing function. Can be a string keyword (see the table below for available easings) or `'none'`.<br>Alternatively, you can pass your own function with the signature <br>`function(time, startAngle, angleDiff, duration)`.<br> The function will be called on each animation frame with the current time (milliseconds since animation start), starting angle, difference in angle (i.e. endAngle - startAngle) and animation duration as arguments, and must return the current angle. |
| animationDuration | Number | 600 | Animation duration in milliseconds |


The predefined animation easing functions:

| Easing name    | Easing |
| -----------    | ------ |
| linear         | Linear |
| easeInQuad     | Quadratic easing in |
| easeOutQuad    | Quadratic easing out |
| easeInOutQuad  | Quadratic easing in/out |
| easeInCubic    | Cubic easing in |
| easeOutCubic   | Cubic easing out |
| easeInOutCubic | Cubic easing in/out |
| easeInQuart    | Quartic (power of 4) easing in |
| easeOutQuart   | Quartic easing out |
| easeInOutQuart | Quartic easing in/out |
| easeInQuint    | Quintic (power of 5) easing in |
| easeOutQuint   | Quintic easing out |
| easeInOutQuint | Quintic easing in/out |
| easeInSine     | Sinusoidal easing in |
| easeOutSine    | Sinusoidal easing out |
| easeInOutSine  | Sinusoidal easing in/out |
| easeInExpo     | Exponential easing in |
| easeOutExpo    | Exponential easing out |
| easeInOutExpo  | Exponential easing in/out |
| easeInCirc     | Circular easing in |
| easeOutCirc    | Circular easing out |
| easeInOutCirc  | Circular easing in/out |

## Other properties and methods

### `updateComplete`

A promise that resolves when the element has finished updating.

```js
circleProgress.value = 50
circleProgress.max = 100
await circleProgress.updateComplete
// Do something when the update is complete
```

## Styling

To customize widget's appearance, you can style its underlying SVG elements which are exposed as `part`s with CSS.
The elements are:

| Part                  | Description |
| --------------------- | ----------- |
| `::part(base)`        | The svg image. You can use this selector to scale the widget. E. g.: `circle-progress::part(base) {width: 200px; height: auto;}` |
| `::part(circle)`      | The entire circle (SVG circle element) |
| `::part(value)`       | The arc representing currently filled progress (SVG path element) |
| `::part(text)`        | Text controlled by `textFormat` option (SVG text element) |
| `::part(text-value)`  | Current value text (SVG tspan element). Appears only for textFormat values of `horizontal`, `vertical`, `valueOnCircle` |
| `::part(text-max)`    | Maximum value text (SVG tspan element). Appears only for textFormat values of `horizontal`, `vertical`, `valueOnCircle` |

You can use any SVG presentation attributes on these elements. Particularly useful are:
`fill`, `stroke`, `stroke-width`, `stroke-linecap` properties. (See [examples][examples])

The default properties are stored in CircleProgress.defaults. You can override the values, so that all instances will be created with the overridden properties.

## Usage with frameworks

Since Circle Progress is a Custom Element, which is natively supported by all modern browsers, it can freely be used with any framework, just like a standard HTML element.

## Browser Support

Chrome, Firefox, Safari (starting with version 14), Edge are supported.

## Contributing

If you noticed a bug or want to suggest a feature or an improvement, please do not hesitate to [open an issue](https://github.com/tigrr/circle-progress/issues/new).

If you want to contribute code, please
- fork the repository,
- make your changes,
- run `npm run check` and `npm test` to make sure everything is ok (you can run tests in watch mode `npm run test:watch`),
- check the demo (index) and examples pages by running `npm start`, which will open the `docs` folder in your browser,
- commit and create a pull request.


## License
© 2018 Tigran Sargsyan

Licensed under ([the MIT License][license])


[vanilla-min]: https://unpkg.com/js-circle-progress/dist/circle-progress.min.js
[site]: https://tigrr.github.io/circle-progress/
[examples]: https://tigrr.github.io/circle-progress/examples.html
[license]: https://github.com/tigrr/circle-progress/blob/master/LICENSE

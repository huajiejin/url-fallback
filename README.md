# Url Fallback


[![NPM version][npm-version]][npm-package]
[![NPM total downloads][downloads-total]][npm-package]
![E2E tests][tests-e2e]
![Unit tests][tests-unit]

A tiny piece of JavaScript code which allows websites to set fallback urls for their resources.

## Getting Started

You can include and setup url fallback rules with:

``` html
<script data-url="your-cdn.com" data-fallbacks="your-backup-cdn.com,your-static-server.com/change/path" data-url-fallback src="https://cdn.jsdelivr.net/npm/@jinshub/url-fallback"></script>
```

Or make your own bundle with tools like [webpack](https://webpack.js.org) and [rollup](https://rollupjs.org):

``` bash
npm i @jinshub/url-fallback
```
``` ts
import { addErrorListener } from '@jinshub/url-fallback'
addErrorListener({
	rules: [
		{
			url: 'your-cdn.com',
			fallbacks: [
				'your-backup-cdn.com',
				'your-static-server.com/change/path',
			],
		},
	]
})
```

You can check if it works by opening the network panel in the Chrome Developer Tools and blocking a resource, then refreshing the page.

## Usage

Retry resources that matched the data-url 2 times:

``` html
<script data-url="your-website.com" data-fallbacks="your-website.com,your-website.com" data-url-fallback src="https://cdn.jsdelivr.net/npm/@jinshub/url-fallback"></script>
```

Retry resources that matched every fallback if the data-url is empty:

``` html
<script data-fallbacks="your-website.com,your-backup-cdn.com,your-static-server.com" data-url-fallback src="https://cdn.jsdelivr.net/npm/@jinshub/url-fallback"></script>
```

Set multiple rules:

``` ts
import { addErrorListener } from '@jinshub/url-fallback'
addErrorListener({
	rules: [
		{
			url: 'your-cdn.com',
			fallbacks: [
				'your-backup-cdn.com',
				'your-static-server.com/change/path',
			],
		},
		{
			fallbacks: [
				'your-img-cdn.com',
				'your-img-cdn1.com',
				'your-img-cdn2.com',
			],
		},
		{
			url: /your-cdn.com/,
			fallbacks: [
				'your-cdn.com',
				'your-cdn.com',
			],
		},
	]
})
```

For more details of addErrorListener, see [the documentation](https://url-fallback.jinshub.com/modules.html#addErrorListener)

## Documentation

For more details of public functions and types, see [https://url-fallback.jinshub.com](https://url-fallback.jinshub.com)

## License

[MIT](https://opensource.org/licenses/MIT)

[npm-version]: https://img.shields.io/npm/v/@jinshub/url-fallback.svg
[npm-package]: https://npmjs.org/package/@jinshub/url-fallback
[downloads-total]: https://img.shields.io/npm/dt/@jinshub/url-fallback.svg
[tests-e2e]: https://img.shields.io/badge/e2e%20tests-16%20passed-success
[tests-unit]: https://img.shields.io/badge/unit%20tests-4%20passed-success

# Url Fallback


[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][npm-url]

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
```

## License

[MIT](https://opensource.org/licenses/MIT)

[npm-image]: https://img.shields.io/npm/v/@jinshub/url-fallback.svg
[npm-url]: https://npmjs.org/package/@jinshub/url-fallback
[download-image]: https://img.shields.io/npm/dm/@jinshub/url-fallback.svg

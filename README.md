# Url Fallback


[![NPM version][npm-version]][npm-package]
![NPM dependents][dependents]
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
```

## Usages

## License

[MIT](https://opensource.org/licenses/MIT)

[npm-version]: https://img.shields.io/npm/v/@jinshub/url-fallback.svg
[npm-package]: https://npmjs.org/package/@jinshub/url-fallback
[downloads-total]: https://img.shields.io/npm/dt/@jinshub/url-fallback.svg
[dependents]: https://img.shields.io/librariesio/dependents/npm/@jinshub/url-fallback
[tests-e2e]: https://img.shields.io/badge/e2e%20tests-15%20passed-success
[tests-unit]: https://img.shields.io/badge/unit%20tests-4%20passed-success

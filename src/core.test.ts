import { getMatchAndFallbacks, ErrorListenerConfig } from './core'

describe('getMatchAndFallbacks', () => {
	it('should avoid duplicated match and fallback if url is empty', () => {
		const originalUrl = 'http://your-img-cdn.com/assets/example.png'
		const config: ErrorListenerConfig = {
			rules: [
				{
					fallbacks: [
						'your-img-cdn.com',
						'your-img-cdn1.com',
						'your-img-cdn2.com',
					],
				},
			],
		}

		const matchAndFallbacks = getMatchAndFallbacks(originalUrl, config)

		expect(matchAndFallbacks).toStrictEqual([
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn1.com' },
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn2.com' },
		])
	})
	
	it('should not avoid duplicated match and fallback if url is not empty', () => {
		const originalUrl = 'http://your-img-cdn.com/assets/example.png'
		const config: ErrorListenerConfig = {
			rules: [
				{
					url: 'your-img-cdn.com',
					fallbacks: [
						'your-img-cdn.com',
						'your-img-cdn1.com',
						'your-img-cdn2.com',
					],
				},
			],
		}

		const matchAndFallbacks = getMatchAndFallbacks(originalUrl, config)

		expect(matchAndFallbacks).toStrictEqual([
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn.com' },
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn1.com' },
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn2.com' },
		])
	})

	it('should support regexp', () => {
		const originalUrl1 = 'http://your-img-cdn.com/assets/example.png'
		const originalUrl2 = 'http://your-backup-cdn.com/change/path/assets/example.png'
		const config: ErrorListenerConfig = {
			rules: [
				{
					url: /your-img-cdn.com|your-static-server.com|your-backup-cdn.com\/change\/path/,
					fallbacks: [
						'your-backup-cdn.com/change/path',
						'127.0.0.1:9999',
						'your-static-server.com',
					],
				},
			],
		}

		const matchAndFallbacks1 = getMatchAndFallbacks(originalUrl1, config)
		const matchAndFallbacks2 = getMatchAndFallbacks(originalUrl2, config)

		expect(matchAndFallbacks1).toStrictEqual([
			{ match: 'your-img-cdn.com', fallback: 'your-backup-cdn.com/change/path' },
			{ match: 'your-img-cdn.com', fallback: '127.0.0.1:9999' },
			{ match: 'your-img-cdn.com', fallback: 'your-static-server.com' },
		])
		expect(matchAndFallbacks2).toStrictEqual([
			{ match: 'your-backup-cdn.com/change/path', fallback: 'your-backup-cdn.com/change/path' },
			{ match: 'your-backup-cdn.com/change/path', fallback: '127.0.0.1:9999' },
			{ match: 'your-backup-cdn.com/change/path', fallback: 'your-static-server.com' },
		])
	})

	it('should support mutiple matched rules', () => {
		const originalUrl = 'http://your-img-cdn.com/assets/example.png'
		const config: ErrorListenerConfig = {
			rules: [
				{
					fallbacks: [
						'your-img-cdn.com',
						'your-img-cdn1.com',
						'your-img-cdn2.com',
					],
				},
				{
					url: /your-img-cdn.com\/assets/,
					fallbacks: [
						'your-backup-cdn.com/change/path',
						'127.0.0.1:9999',
						'your-static-server.com',
					],
				},
			],
		}

		const matchAndFallbacks = getMatchAndFallbacks(originalUrl, config)

		expect(matchAndFallbacks).toStrictEqual([
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn1.com' },
			{ match: 'your-img-cdn.com', fallback: 'your-img-cdn2.com' },
			{ match: 'your-img-cdn.com/assets', fallback: 'your-backup-cdn.com/change/path' },
			{ match: 'your-img-cdn.com/assets', fallback: '127.0.0.1:9999' },
			{ match: 'your-img-cdn.com/assets', fallback: 'your-static-server.com' },
		])
	})
})

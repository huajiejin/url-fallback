module.exports = function (api) {
  api.cache(true)

  const presets = [
		["@babel/preset-env", { useBuiltIns: false }],
	]
  const plugins = [
		["@babel/plugin-transform-runtime", { corejs: { version: 3, proposals: true }, version: '^7.17.8', regenerator: true }],
	]

  return {
    presets,
    plugins,
		targets: {
			"chrome": "58",
			"ie": "11"
		},
  }
}
module.exports = ["Example.truth", {
	Types: {
		Code: null,
		Exclude: [
			"Products",
			"Tags"
		]
	},
	Products: {
		Code: "Types",
		Include: [/\d{3}-\d{3}-\d{3}/]
	},
	Tags: {
		Code: "Types",
		Include: [/Material-(\w+)/]
	}
}
]
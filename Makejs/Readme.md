
#Makejs Specification

## Future Functionality
	
	- make.toS3() -- Uses S3cmd to upload to the given bucket
	- make.temp(path => { .. }); -- Creates a temporary folder, executes the operations, and removes it after the function completes.

	- Declaration file generation, possibly using the TypesBundler tool from the Truth compiler.

	- Deal with linked dependencies (fixing npm link problems)
	- Deal with removing old files from build and bundle folders that weren't emitted.
	
	- Support for templates, that can be defined in the package.json:
		...
		"makejs": {
			"template": "library",
			"options": {
				...
			}
		}
	
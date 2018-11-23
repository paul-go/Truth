import * as X from "../Core/X";


/**
 * Jest entry point.
 */
module.exports = async function()
{
	// Override the Fs implementation
	// with one that avoids files being saved
	// to disk, to avoid the necessity for cleanup.
	X.Fs.override(require("memfs"));
}

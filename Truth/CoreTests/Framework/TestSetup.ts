import * as X from "../X";

//! Is this code even needed anymore?

/* eslint require-await: 0 */

/**
 * Jest entry point.
 */
module.exports = async function()
{
	// Override the Fs implementation
	// with one that avoids files being saved
	// to disk, to avoid the necessity for cleanup.
	X.Fs.override(require("memfs"));
};

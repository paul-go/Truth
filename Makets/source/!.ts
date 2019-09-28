#!/usr/bin/env node

/** @internal */
namespace make
{
	// Built-In
	export const Fs: typeof import("fs") = require("fs");
	export const Path: typeof import("path") = require("path");
	export const ChildProcess: typeof import("child_process") = require("child_process");
	export const Url: typeof import("url") = require("url");
	export const ZLib: typeof import("zlib") = require("zlib");

	// Installed
	export const FsExtra: typeof import("fs-extra") = require("fs-extra");
	export const Terser: typeof import("terser") = require("terser");
	export const SemVer: typeof import("semver") = require("semver");
	export type SemVer = typeof SemVer;
}

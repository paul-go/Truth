#!/usr/bin/env node

// Built-In
const Fs: typeof import("fs") = require("fs");
const Path: typeof import("path") = require("path");
const ChildProcess: typeof import("child_process") = require("child_process");
const Url: typeof import("url") = require("url");
const ZLib: typeof import("zlib") = require("zlib");

// Installed
const FsExtra: typeof import("fs-extra") = require("fs-extra");
const Terser: typeof import("terser") = require("terser");
const SemVer: typeof import("semver") = require("semver");
type SemVer = typeof SemVer;

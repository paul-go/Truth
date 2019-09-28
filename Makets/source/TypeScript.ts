
namespace make
{
	/**
	 * Parse typescript functions arguemments and generate argument array 
	 */
	function parseTypescriptArguments(a: any, b?: any, c = false)
	{
		let path = 
			typeof a === "string" ? a : 
			typeof b === "string" ? b : "./tsconfig.json";
	
		const tsConfigOverrides: TsConfig | null = 
			typeof a === "object" ? a :
			typeof b === "object" ? b : null;
	
		const watch: boolean = typeof b === "boolean" ? b : c;
	
		if (tsConfigOverrides !== null)
		{
			const existingConfig = readJson(path);
			const augmentedConfig = mergeDeep(existingConfig, tsConfigOverrides);
			const tempFile = `tsconfig.${random()}.json`;
			const tempPath = Path.join(Path.parse(path).dir, tempFile);
			
			writeJson(tempPath, augmentedConfig);
			
			make.on("exit", () => 
			{
				make.delete(tempPath);
			});
			
			path = tempPath;
		}

		const args = ["--project", path];

		if (watch) 
			args.push("--watch");

		return args;
	}

	/**
	 * Compiles the typescript at the specified location, 
	 * and with any additional tsconfig compilerOptions entries.
	 */
	export async function typescript(path: string, tsConfigOverrides: TsConfig): Promise<void>;
	export async function typescript(path: string): Promise<void>;
	export async function typescript(tsConfigOverrides: TsConfig): Promise<void>;
	export async function typescript(a: any, b?: any)
	{
		console.log("Running TypeScript Compiler");
		await spawn("tsc", parseTypescriptArguments(a, b, false));
	}

	/**
	 * Compiles and watches for changes in TypeScript at the specified location, 
	 * and with any additional tsconfig compilerOptions entries.
	 */
	export function typescriptWatcher(path: string, tsConfigOverrides: TsConfig): ReturnOfSpawn;
	export function typescriptWatcher(path: string): ReturnOfSpawn;
	export function typescriptWatcher(tsConfigOverrides: TsConfig): ReturnOfSpawn;
	export function typescriptWatcher(a: any, b?: any)
	{
		console.log("Running TypeScript Compiler (Watcher)");
		return spawn("tsc", parseTypescriptArguments(a, b, true));
	}
	
	//# Type definitions copied from https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts
	
	export interface MapLike<T = any>
	{
		[index: string]: T;
	}
	
	export const enum ModuleResolutionKind
	{
		"classic" = "classic",
		"node" = "node"
	}
	
	export interface PluginImport
	{
		name: string;
	}
	
	export interface ProjectReference
	{
		/** A normalized path on disk */
		path: string;
		/** The path as the user originally wrote it */
		originalPath?: string;
		/**
		 * True if the output of this reference should be prepended to the output 
		 * of this project. Only valid for --outFile compilations
		 */
		prepend?: boolean;
		/** True if it is intended that this reference form a circularity */
		circular?: boolean;
	}
	
	export interface TsConfig
	{
		compilerOptions?: CompilerOptions;
		files?: string[];
		include?: string[];
		exclude?: string[];
	}
	
	export interface CompilerOptions
	{
		allowJs?: boolean;
		allowSyntheticDefaultImports?: boolean;
		allowUnreachableCode?: boolean;
		allowUnusedLabels?: boolean;
		alwaysStrict?: boolean;
		baseUrl?: string;
		charset?: string;
		checkJs?: boolean;
		declaration?: boolean;
		declarationMap?: boolean;
		emitDeclarationOnly?: boolean;
		declarationDir?: string;
		disableSizeLimit?: boolean;
		downlevelIteration?: boolean;
		emitBOM?: boolean;
		emitDecoratorMetadata?: boolean;
		experimentalDecorators?: boolean;
		forceConsistentCasingInFileNames?: boolean;
		importHelpers?: boolean;
		inlineSourceMap?: boolean;
		inlineSources?: boolean;
		isolatedModules?: boolean;
		jsx?: JsxEmit;
		keyofStringsOnly?: boolean;
		lib?: string[];
		locale?: string;
		mapRoot?: string;
		maxNodeModuleJsDepth?: number;
		module?: ModuleKind;
		moduleResolution?: ModuleResolutionKind;
		noEmit?: boolean;
		noEmitHelpers?: boolean;
		noEmitOnError?: boolean;
		noErrorTruncation?: boolean;
		noFallthroughCasesInSwitch?: boolean;
		noImplicitAny?: boolean;
		noImplicitReturns?: boolean;
		noImplicitThis?: boolean;
		noStrictGenericChecks?: boolean;
		noUnusedLocals?: boolean;
		noUnusedParameters?: boolean;
		noImplicitUseStrict?: boolean;
		noLib?: boolean;
		noResolve?: boolean;
		out?: string;
		outDir?: string;
		outFile?: string;
		paths?: MapLike<string[]>;
		preserveConstEnums?: boolean;
		preserveSymlinks?: boolean;
		project?: string;
		reactNamespace?: string;
		jsxFactory?: string;
		composite?: boolean;
		incremental?: boolean;
		tsBuildInfoFile?: string;
		removeComments?: boolean;
		rootDir?: string;
		rootDirs?: string[];
		skipLibCheck?: boolean;
		skipDefaultLibCheck?: boolean;
		sourceMap?: boolean;
		sourceRoot?: string;
		strict?: boolean;
		strictFunctionTypes?: boolean;
		strictBindCallApply?: boolean;
		strictNullChecks?: boolean;
		strictPropertyInitialization?: boolean;
		stripInternal?: boolean;
		suppressExcessPropertyErrors?: boolean;
		suppressImplicitAnyIndexErrors?: boolean;
		target?: ScriptTarget;
		traceResolution?: boolean;
		resolveJsonModule?: boolean;
		types?: string[];
		/** Paths used to compute primary types search locations */
		typeRoots?: string[];
		esModuleInterop?: boolean;
	}
	
	enum ModuleKind
	{
		none = "none",
		commonjs = "commonjs",
		amd = "amd",
		umd = "umd",
		system = "system",
		es2015 = "es2015",
		esnext = "esnext"
	}
	
	export const enum JsxEmit
	{
		none = "none",
		preserve = "preserve",
		react = "react",
		reactnative = "reactnative"
	}
	
	export const enum ScriptTarget
	{
		es3 = "es3",
		es5 = "es5",
		es2015 = "es2015",
		es2016 = "es2016",
		es2017 = "es2017",
		es2018 = "es2018",
		es2019 = "es2019",
		esnext = "esnext",
		json = "json",
		latest = "latest",
	}
	
	/**
	 * Simple object check.
	 * @param item
	 * @returns {boolean}
	 */
	function isObject(item: any): item is MapLike
	{
		return (item && typeof item === "object" && !Array.isArray(item));
	}

	/**
	 * Deep merge two objects.
	 * @param target
	 * @param ...sources
	 */
	function mergeDeep(target: MapLike, ...sources: MapLike[]): MapLike
	{
		if (!sources.length)
			return target;
		
		const source = sources.shift();
		
		if (isObject(target) && isObject(source))
		{
			for (const key in source)
			{
				if (isObject(source[key]))
				{
					if (!target[key])
						Object.assign(target, { [key]: {} });
					
					mergeDeep(target[key], source[key]);
				}
				else
				{
					Object.assign(target, { [key]: source[key] });
				}
			}
		}
		
		return mergeDeep(target, ...sources);
	}
}


// 
// This file contains the code that runs make.ts scripts
// It always acts as the main entry point.
// 

namespace make
{
	export type Fn = (args: string[]) => Promise<void> | void;
	type P = string | Fn;
 
	/**
	 * 
	 */
	export function on(fn: Fn): void;
	export function on(keyword: string, fn: Fn): void;
	export function on(keyword1: string, keyword2: string, fn: Fn): void;
	export function on(keyword1: string, keyword2: string, keyword3: string, fn: Fn): void;
	export function on(keyword1: string, keyword2: string, keyword3: string, keyword4: string, fn: Fn): void;
	export function on(keyword1: string, keyword2: string, keyword3: string, keyword4: string, keyword5: string, fn: Fn): void;
	export function on(p1: P, p2?: P, p3?: P, p4?: P, p5?: P, p6?: P): void
	{
		const args = [p1, p2, p3, p4, p5, p6].filter(v => !!v);
		const fn = <Fn>args[args.length - 1];
		const keywords = <string[]>args.slice(0, -1);

		if (keywords.length === 0)
			keywords.push("");
		
		makeTasks.push(new MakeTask(keywords, fn));
	}

	/**
	 * @internal
	 */
	export namespace on
	{
		/**
		 * Starts the make process.
		 */
		export async function start(args: string[], tags: string[])
		{
			for (const task of makeTasks)
			{
				if (!task.tags.some(tag => tag === "" || tags.includes(tag)))
					continue;

				const result = task.taskFn(args);
				if (result instanceof Promise)
					await result;
			}
		}

		/**
		 * Triggers life cycle events for sync stages (exit, kill)
		 */
		export function stage(args: string[], tag: string)
		{
			const tasks = makeTasks.filter(task => task.tags.includes(tag));
			for (const task of tasks)
			{
				task.taskFn(args);
			}
		}

		/**
		 * Triggers life cycle events for async stages (start, init)
		 */
		export async function stageAsync(args: string[], tag: string)
		{
			const tasks = makeTasks.filter(task => task.tags.includes(tag));
			for (const task of tasks)
			{
				const result = task.taskFn(args);
				if (result instanceof Promise)
					await result;
			}
		}
	}

	/** */
	class MakeTask
	{
		constructor(
			readonly tags: string[],
			readonly taskFn: Fn)
		{ }
	}

	/** */
	const makeTasks: MakeTask[] = [];
	
	/**
	 * Transfer execution of the make process to another make process,
	 * using the make.ts file found at the specified relative directory path.
	 * This function is also used to initiate the starting makets process.
	 * 
	 * @param directory The directory that contains the make.ts file
	 * @param tags An optional array containing the tags that control
	 * the functions to be executed in the make.ts script. If omitted,
	 * the tags specified at the command line are used.
	 */
	export async function transfer(directory: string, tags?: string[])
	{
		const t = tags || process.argv.filter(arg => /^[a-z]+(-[a-z]+)*$/gi.test(arg));
		
		const getFile = (file: string) =>
		{
			const makeFilePath = Path.join(directory, file);
			return Fs.existsSync(makeFilePath) ?
				makeFilePath : "";
		};
		
		const makeFilePath = getFile("make.ts") || getFile("make.js");
		if (!makeFilePath)
			throw new Error("No make.ts or make.js file found at: " + directory);
		
		const makeFileText = Fs.readFileSync(makeFilePath, "utf8");
		const makeFileFunction = new Function("make", makeFileText).bind(null);
		
		// Running this function causes all the make.on() calls
		// to be collected, which are run in the next step.
		makeFileFunction(make);
		
		// Create the build and bundle folders
		FsExtra.mkdirpSync("./build");
		FsExtra.mkdirpSync("./bundle");
		
		await make.on.stageAsync(process.argv, "start");
		await make.on.stageAsync(process.argv, "init");
		await make.on.start(process.argv, t);
	}
	
	process.on("SIGINT", () => 
	{
		make.on.stage(process.argv, "kill");
	});

	process.on("beforeExit", () => 
	{
		make.on.stage(process.argv, "idle");
	});

	process.on("exit", () => 
	{
		make.on.stage(process.argv, "exit");
	});
	
	//# Entry Point

	setImmediate(() =>
	{
		const directory = process.cwd();
		transfer(directory);
		console.log("Complete.");
	});
}

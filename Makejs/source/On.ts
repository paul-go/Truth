
namespace make
{
	export type Fn = (args: string[]) => Promise<void> | void;
	type P = string | Fn;
 
	/**
	 * 
	 */
	export function on(fn: Fn): void;
	export function on(tag: string, fn: Fn): void;
	export function on(tag1: string, t2: string, fn: Fn): void;
	export function on(tag1: string, tag2: string, t3: string, fn: Fn): void;
	export function on(tag1: string, tag2: string, tag3: string, tag4: string, fn: Fn): void;
	export function on(tag1: string, tag2: string, tag3: string, tag4: string, tag5: string, fn: Fn): void;
	export function on(p1: P, p2?: P, p3?: P, p4?: P, p5?: P, p6?: P): void
	{
		const args = [p1, p2, p3, p4, p5, p6].filter(v => !!v);
		const fn = <Fn>args[args.length - 1];
		const tags = <string[]>args.slice(0, -1);

		if (tags.length === 0)
			tags.push("");

		makeTasks.push(new MakeTask(tags, fn));
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

		export function stage(args: string[], tag: string)
		{
			const tasks = makeTasks.filter(task => task.tags.includes(tag));
			for(const task of tasks)
			{
				task.taskFn(args);
			};
		}

		export async function stageAsync(args: string[], tag: string)
		{
			const tasks = makeTasks.filter(task => task.tags.includes(tag));
			for(const task of tasks)
			{
				const result = task.taskFn(args);
				if (result instanceof Promise)
					await result;
			};
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
}

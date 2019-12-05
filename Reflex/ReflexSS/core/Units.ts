
interface Number
{
	/** Gets the numeric value in string form, formatted as a "ch" unit. */
	readonly ch: Reflex.SS.Unit<Reflex.SS.UnitType.ch>;
	
	/** Gets the numeric value in string form, formatted as a "cm" unit. */
	readonly cm: Reflex.SS.Unit<Reflex.SS.UnitType.cm>;
	
	/** Gets the numeric value in string form, formatted as a "deg" unit. */
	readonly deg: Reflex.SS.Unit<Reflex.SS.UnitType.deg>;
	
	/** Gets the numeric value in string form, formatted as a "dpcm" unit. */
	readonly dpcm: Reflex.SS.Unit<Reflex.SS.UnitType.dpcm>;
	
	/** Gets the numeric value in string form, formatted as a "dpi" unit. */
	readonly dpi: Reflex.SS.Unit<Reflex.SS.UnitType.dpi>;
	
	/** Gets the numeric value in string form, formatted as a "dppx" unit. */
	readonly dppx: Reflex.SS.Unit<Reflex.SS.UnitType.dppx>;
	
	/** Gets the numeric value in string form, formatted as a "em" unit. */
	readonly em: Reflex.SS.Unit<Reflex.SS.UnitType.em>;
	
	/** Gets the numeric value in string form, formatted as a "ex" unit. */
	readonly ex: Reflex.SS.Unit<Reflex.SS.UnitType.ex>;
	
	/** Gets the numeric value in string form, formatted as a "fr" unit. */
	readonly fr: Reflex.SS.Unit<Reflex.SS.UnitType.fr>;
	
	/** Gets the numeric value in string form, formatted as a "grad" unit. */
	readonly grad: Reflex.SS.Unit<Reflex.SS.UnitType.grad>;
	
	/** Gets the numeric value in string form, formatted as a "hz" unit. */
	readonly hz: Reflex.SS.Unit<Reflex.SS.UnitType.hz>;
	
	/** Gets the numeric value in string form, formatted as a "in" unit. */
	readonly in: Reflex.SS.Unit<Reflex.SS.UnitType.in>;
	
	/** Gets the numeric value in string form, formatted as a "khz" unit. */
	readonly khz: Reflex.SS.Unit<Reflex.SS.UnitType.khz>;
	
	/** Gets the numeric value in string form, formatted as a "mm" unit. */
	readonly mm: Reflex.SS.Unit<Reflex.SS.UnitType.mm>;
	
	/** Gets the numeric value in string form, formatted as a "ms" unit. */
	readonly ms: Reflex.SS.Unit<Reflex.SS.UnitType.ms>;
	
	/** Gets the numeric value in string form, formatted as a "pc" unit. */
	readonly pc: Reflex.SS.Unit<Reflex.SS.UnitType.pc>;
	
	/** Gets the numeric value in string form, formatted as a percentage unit. */
	readonly pct: Reflex.SS.Unit<Reflex.SS.UnitType.pct>;
	
	/** Gets the numeric value in string form, formatted as a "pt" unit. */
	readonly pt: Reflex.SS.Unit<Reflex.SS.UnitType.pt>;
	
	/** Gets the numeric value in string form, formatted as a "px" unit. */
	readonly px: Reflex.SS.Unit<Reflex.SS.UnitType.px>;
	
	/** Gets the numeric value in string form, formatted as a "q" unit. */
	readonly q: Reflex.SS.Unit<Reflex.SS.UnitType.q>;
	
	/** Gets the numeric value in string form, formatted as a "rad" unit. */
	readonly rad: Reflex.SS.Unit<Reflex.SS.UnitType.rad>;
	
	/** Gets the numeric value in string form, formatted as a "rem" unit. */
	readonly rem: Reflex.SS.Unit<Reflex.SS.UnitType.rem>;
	
	/** Gets the numeric value in string form, formatted as a "s" unit. */
	readonly s: Reflex.SS.Unit<Reflex.SS.UnitType.s>;
	
	/** Gets the numeric value in string form, formatted as a "turn" unit. */
	readonly turn: Reflex.SS.Unit<Reflex.SS.UnitType.turn>;
	
	/** Gets the numeric value in string form, formatted as a "vh" unit. */
	readonly vh: Reflex.SS.Unit<Reflex.SS.UnitType.vh>;
	
	/** Gets the numeric value in string form, formatted as a "vmax" unit. */
	readonly vmax: Reflex.SS.Unit<Reflex.SS.UnitType.vmax>;
	
	/** Gets the numeric value in string form, formatted as a "vmin" unit. */
	readonly vmin: Reflex.SS.Unit<Reflex.SS.UnitType.vmin>;
	
	/** Gets the numeric value in string form, formatted as a "vw" unit. */
	readonly vw: Reflex.SS.Unit<Reflex.SS.UnitType.vw>;
	
	/** Gets the numeric value in string form, formatted as a "x" unit. */
	readonly x: Reflex.SS.Unit<Reflex.SS.UnitType.x>;
	
}

namespace Reflex.SS
{
	/**
	 * 
	 */
	export enum UnitType
	{
		ch = "ch",
		cm = "cm",
		deg = "deg",
		dpcm = "dpcm",
		dpi = "dpi",
		dppx = "dppx",
		em = "em",
		ex = "ex",
		fr = "fr",
		grad = "grad",
		hz = "hz",
		in = "in",
		khz = "khz",
		mm = "mm",
		ms = "ms",
		pc = "pc",
		pct = "pct",
		pt = "pt",
		px = "px",
		q = "q",
		rad = "rad",
		rem = "rem",
		s = "s",
		turn = "turn",
		vh = "vh",
		vmax = "vmax",
		vmin = "vmin",
		vw = "vw",
		x = "x"
	}
	
	/**
	 * 
	 */
	export class Unit<T = UnitType>
	{
		constructor(
			readonly value: number,
			readonly type: UnitType)
		{ }
		
		/** */
		toString()
		{
			return this.type === UnitType.pct ?
				this.value + "%" :
				this.value + this.type;
		}
	}

	const types = <(keyof typeof UnitType)[]>Object.keys(UnitType);
	types.forEach(suffix =>
	{
		Object.defineProperty(Number.prototype, suffix, {
			get: function(this: number)
			{
				return new Unit(this, UnitType[suffix]);
			}
		});
	});
}

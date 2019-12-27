
namespace Backer.Tests.Util 
{
	export const Headers = `
any
object : any
string : any
number : any
bigint : any
boolean : any

/".+" : string
/(\\+|-)?(([1-9]\\d{0,17})|([1-8]\\d{18})|(9[01]\\d{17})) : number
/(0|([1-9][0-9]*)) : bigint
/(true|false) : boolean

`;
}

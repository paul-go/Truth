const Person = {
  typePath: ["Person"],
  Name: {
    typePath: ["Person", "Name"]
  },
  Age: {
    typePath: ["Person", "Age"]
  }
};

const Employee = {
  typePath: ["Employee"],
  Name: {
    typePath: ["Employee", "Name"]
  },
  Age: {
    typePath: ["Employee", "Age"]
  },
  Salary: {
    typePath: ["Employee", "Salary"]
  }
};

new Reflex.Core.ContentMeta(Employee);
new Reflex.Core.ContentMeta(Employee.Name);
new Reflex.Core.ContentMeta(Employee.Age);
new Reflex.Core.ContentMeta(Employee.Salary);
new Reflex.Core.ContentMeta(Person);
new Reflex.Core.ContentMeta(Person.Name);
new Reflex.Core.ContentMeta(Person.Age);

const source = `
String
/".+" : String

Number
/\d+ : Number

Boolean
true, false : Boolean

Person:
  Name: String
  Age: Number

Employee: Person
  Salary: Number

@data

E1: Employee
  Name: "Bob"
  Age: 21
  Salary: 1000

E2: Employee
  Name: "Alice"
  Age: 54
  Salary: 1200

E3: Employee
  Name: "Joe"
  Age: 27
  Salary: 1400

P1: Person
  Name: "Parsa"
  Age: 18

P2: Person
  Name: "John"
  Age: 16

`;

function sleep(time)
{
  return new Promise(resolve => setTimeout(resolve, time));
}

async function delay(time, value)
{
  await sleep(time);
  return value;
}

async function main() 
{
  const { Talk } = Reflex;
  const { tt } = Talk;

  await Talk.System.fromText(source.trim());
  const doc = Talk.System.this.doc;

  const query = await tt(delay(1000, Employee));

  const result = query.run();

  console.log(result.map(t => t.name));
}

main();


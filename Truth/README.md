![](./hero.jpg)

## Introduction

Truth is a method for classifying conscious understanding. It does so by providing the human a computationally-aware method of indicating _what things are_ ("is-a" relationships), and what they have ("has-a" relationships). Through these declarations of existence, a body of information is gradually formed that is guaranteed to be devoid of inaccuracies and falsehoods.

Truth was not constructed by fiat. It's characteristics are not a mere convenient recipe designed to address some transient need. Rather, it's a design that was uncovered through ontological and epistemological reasoning, and refined through intense scrutiny. Because of this, many of the rules can be intuited without reading any documentation, and instead by simply walking through the line of reasoning intellectually.

In Truth, there is no inherent distinction between structure and data, nor is there is no concept of a binary class/instance relationship. Everything is a treated as an abstract *Type*. Structural constraints are imposed simply by establishing an is-a relationship between two types.

**Truth is not a system for expressing computation**. Truth is immutable, stateless, unconditional and timeless. Therefore, writing Truth is not to be considered an act of *programming*.

## Language Overview

In the beginning, Truth is formless and empty. There exists absolutely nothing–no strings, numbers, or data types of any kind. There are no keywords or built-in framework. The main construct is the `:`, called the *Joint*, which loosely translates to "is a kind of":

```
Plant
Tree : Plant
```

Separate lines in Truth are like sentences, each being a separate statement of existence. And so in English, the above Truth translates to "There exists what we call Plant. There also exists what we call Tree, which is a kind of Plant".

*Has-a* relationships are expressed through indentation. The indentation pattern is infinitely recursive, allowing statements to be nested as many levels as necessary.

```
Number
Plant
Tree : Plant
	Height : Number
		Minimum : Number
		Maximum : Number
```

## Patterns & Aliases

In Truth, there are *Patterns*, which are regular expressions that essentially say "when a term to the right of a joint is encountered that conforms to this pattern, make it a ...". As stated above, Truth does not have any built-in data types. They must be established by the user, with patterns being one of the core mechanisms by which this is done. Lines that start with a `/` are interpreted as Patterns:

```
Decimal
/\d+\.\d+ : Decimal
Pi : 3.1415926
Phi : 1.6180339
```

This Truth establishes a rule that any term composed from 1 or more digits, followed by a dot, followed by 1 or more digits is assumed to be a Decimal. And so we have two constants declared, Pi and Phi, which are inferred as Decimals.

## Inheritance

Single and multiple inheritance are foundational constructs of cognition, and so they exist in Truth. The Truth compiler accepts any inheritance hierarchy forming an arbitrarily complex directed acyclic graph. Below, we demonstrate a classic diamond-shaped inheritance structure:

```
String
Number
Language

Employee
	Name : String
	
Engineer : Employee
	Specialization : Language
	
Salesman : Employee
	Commission Rate : Number
	
Sales Engineer : Engineer, Salesman
```

From this Truth, the compiler would be able to infer that `Sales Engineer` has a `Name`, a `Specialization` and a `Commission Rate`, all without these being declared explicitly.

## Faults

There are many ways by which falsehoods may contaminate Truth. Fortunately, the Truth compiler is able to detect these and call them out. One such falsehood is described below, specifically on the last line:

```
Language

Systems Language : Language
C++, Rust : Systems Language

Query Language : Language
SQL, GraphQL : Query Language

Engineer
	Specialization : Language

Systems Engineer : Engineer
	Specialization : Systems Language

Robert : Systems Engineer
	Specialization : Rust

Joseph : Systems Engineer
	Specialization : SQL
```

An *Engineer* has a *Specialization*, which is a *Language*. A *Systems Engineer* is defined as a kind of engineer whose specialization is more specifically a *Systems Language*. Joseph purports to be a Systems Engineer, however, his specialization is *SQL*, which is a *Query Language*, and hence the falsehood.

## Project Status

- The Truth compiler is being actively developed by a real company with enterprise customers and a sound business model. It's being used to tackle some of the most challenging data complexity problems.

## Installing

```
npm install truth-compiler --save
```

## Longevity

Truth is being actively developed by a real company with enterprise customers and a sound business model. It's being used to tackle some of the most challenging data complexity problems.

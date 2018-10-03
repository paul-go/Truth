![Hero](Hero.png)

# Truth: A Domain Representation Language

*Truth* is a stateless meta-language for data modeling and storage. Its highly minimalistic (but deceivingly powerful) syntax is useful for declaring the existence of entities within a domain, by making *is-a* and *has-a* statements. You can learn everything there is to know about Truth in a few minutes, even if you're not really a programmer.

Truth makes no distinction between *data* and *typing*. Everything in Truth is both data and typing *at the same time* (because of this, it could be said that Truth is [homoiconic](https://en.wikipedia.org/wiki/Homoiconicity)). This, in addition to a terse, human-friendly syntax, makes Truth a great replacement for JSON, XML, YAML, TOML, or INI when the lack of a well-typed system (characteristic of these languages) is causing you grief.

You can use Truth for type-safe data storage. You can use it as a baseline for generating language-specific scaffolding, or SQL CREATE TABLE statements. It also functions as a disposable hack pad in the early stages of a project, when trying to wrap your head around what the domain *looks like*, from a data-structural point of view. There are likely many other uses as well.

Truth draws on ideas from TypeScript, LISP, Python, CSS, Markdown, various theorem provers, and brings many new ideas of it's own. It is believed to be completely [sound](https://en.wikipedia.org/wiki/Soundness), and this will be formally proven at some point in the future.

You can think of Truth as a type system without a language. The idea is to use this type system to quickly construct your own type-safe vocabulary that describes your domain. You then plug in "Agents" (which are blocks of code written in TypeScript) that act upon the terms you've defined in your document, and perform various functions such as generating code, API endpoints, or even complete apps.



## Getting Started

- If you're interested in learning Truth, most of everything you'll need to know is covered in the language [walk through](https://www.github.com/paul-go/Truth/wiki/Walk-Through.md). 
- For a more in-depth analysis of how odd cases are handled, see the [language rules](https://www.github.com/paul-go/Truth/wiki/LanguageRules.md) page.
- If you're interested in reading about the goals of Truth, read the Truth [manifesto](https://www.github.com/paul-go/Truth/wiki/Manifesto.md).



## Status

We're currently building the Truth compiler, along with integration with Visual Studio Code to allow the standard IDE services (statement completion, code navigation, refactoring, etc). This will be released on GitHub shortly.



## Contributions

If interested in contributing to this specification, please contact Paul Go at: paul (at) getblank (dot) com


# Pomeranian

Pomeranian describes applications through groups and nested page objects so tests
can express interactions in the application's own vocabulary.

## Language

**Author**:
A maintainer of Pomeranian: any person who works with agents to facilitate
development of Pomeranian itself.
_Avoid_: Developer or User, when referring to someone maintaining Pomeranian.

**Developer**:
A person who uses Pomeranian to define page objects and write tests for an
application.
_Avoid_: User, when referring to someone consuming Pomeranian.

**User**:
A person who interacts with the application being tested, whose interactions
the tests can simulate.

**Page object group**:
A named grouping of page objects and other groups, with actions and assertions
that require no element target of its own. Short form: group.
_Avoid_: Page, which refers to Playwright's page.

**Page object**:
A named representation of a component or element. One page object can correspond
to zero, one, or multiple matching elements.

**Root**:
The developer-defined entry point into an application's page-object tree. An
outermost page object is not automatically a Root.

**Target**:
The description of which elements a page object represents.

**Declared tree**:
The stable hierarchy of groups and page objects that describes an application.

**Derived page object**:
An additional page object of the same kind as an existing one, with a changed
element selection, usually to narrow a collection.

**Ad-hoc tree**:
A page object and its descendants used without a Root.

**Fixture scenario**:
A named example of application behavior used to exercise a page object's contract
or a composition of equally important page objects.

# Pomeranian

Pomeranian describes applications through groups and nested page objects so tests
can express interactions in the application's own vocabulary.

## Project status

Pomeranian is under development. Its first available behavior is an ad-hoc
`Element_PO` for clicking elements and asserting their text in Playwright Test.
The implementation is available in the private workspace and has not been
published as a package release.

Start with [the Element_PO guide](guide/element-po.md) to create a page object
before navigation and verify a counter. Groups and nested page objects remain
part of the project's planned direction.

The [PageObject guide](guide/page-object.md) describes core locator construction
and the inherited factory. The [PageObjectNode guide](guide/page-object-node.md)
describes the shared page, name, and action-step foundation.

## Vocabulary

A **page object** represents an application component or interaction subject.
An **element page object** represents DOM elements and can have zero, one, or
multiple matches. A **page object group** organizes page objects and other groups
without requiring an element target of its own. Both are **page object nodes**.
A **target** describes the subjects represented by a page object; an **element
target** describes DOM elements.

Developers use Pomeranian to write application tests. Authors maintain Pomeranian
and its documentation.

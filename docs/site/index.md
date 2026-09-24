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

## Vocabulary

A **page object** represents a component or element. A **page object group**
organizes page objects and other groups without requiring an element target of
its own. A **target** describes the elements represented by a page object.

Developers use Pomeranian to write application tests. Authors maintain Pomeranian
and its documentation.

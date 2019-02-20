# Cypress Aurelia Unit Test

[![Build Status](https://travis-ci.org/silbinarywolf/cypress-aurelia-unit-test.svg?branch=master)](https://travis-ci.org/silbinarywolf/cypress-aurelia-unit-test)
[![npm Version](https://img.shields.io/npm/v/cypress-aurelia-unit-test.svg)](https://www.npmjs.com/package/cypress-aurelia-unit-test)

This is a library designed to feel like the official [aurelia/testing](https://github.com/aurelia/testing) library but instead it is built to work with Cypress.
The purpose of this module is so that components can be visually unit tested as close to reality as possible, ie. in a browser rather than in NodeJS with a virtual DOM.

## Known Limitations

- `viewModel` is `undefined` in Cypress if a component has been annotated with @containerless.
- Appending elements directly to the `document.body` may not work as expected due to the fact that Cypress sandboxes it's test code and application code into seperate iframes as it was not currently designed for you to import components directly. To work around this limitation there is currently some code in place which overrides the functionality of the following methods to redirect calls to the main application iframe.
  - `document.addEventListener`
    - This was added to fix `click.delegate` so that click events were processed as expected.
  - `document.appendChild`
  - `document.querySelector`
  - `document.querySelectorAll`
  - `document.body.appendChild`
  - `document.body.querySelector`
  - `document.body.querySelectorAll`

## Credits

- [Gleb Bahmutov](https://github.com/bahmutov/cypress-react-unit-test) for their Cypress React Unit Test library. It helped me figure out how to get styles working quickly.

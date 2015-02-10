# Innova
A stateful web server administering games of Innovation

Before starting development, run `npm install` to install module dependencies.
Tests are to be placed in test/ and the test suite can be ran with `npm test`.

- engine.js
   Main file defining objects for maintaining game state.  

- cards.js
   I wrote a simple parser to generate this from [a innovation card list]
   Callback functions are used to represent dogma effects of each card.

- types.js
   This file contains objects and "types" that need to be used in multiple files.
   Since Javascript is very loosely typed, I use the enum definitions in this file
   to act as stand-ins. InvalidMove and VictoryCondition are exceptions. Reaction is
    used to indicate player input is required.




[a innovation card list]: http://innovation.boardgamestrategy.net/innovation-card-list/

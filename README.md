# Innova
A stateful web server administering games of Innovation

Before starting development, run `npm install` to install module dependencies.
Tests are written using [Mocha] and the test suite can be ran with `npm test`
while in the Innova directory.

- engine.js:
   Main file defining objects for maintaining game state.  

- cards.js:
   I wrote a simple parser to generate this from [the innovation card list].
   Callback functions are used to represent dogma effects of each card.

- types.js:
   This file contains objects and "types" that need to be used in multiple files.
   Since Javascript is very loosely typed, I use the enum definitions in this file
   to act as stand-ins. InvalidMove and VictoryCondition are exceptions. Reaction is
    used to indicate player input is required.

##Dogmas
There are 105 unique cards in the game.  A large chunk of the work with this project is 
writing each card's dogma effects.  Clarification about how dogma effects work in Innova
is provided here so any developer may contribute.

The last argument to the Card constructor is for passing in that card's dogma effects.  
It expects a function that returns a list containing one element per dogma effect of
that card.  Each element provides an execute function to perform the work of the effect
by changing the game's state.  Execute functions are called sequentially for each
element in the list.  Elements in the list are of different forms depending on the type
of the dogma effect.
####Demand Dogma
```javascript
{ 
   demand: true,
   execute: function( game, caller, callee ) {}
}
```
- caller is the player that activated that card's dogmas
- callee is the player currently being effected

####Non-demand Dogma
```javascript
{
   demand: false,
   execute: function( game, player ) {
               if( gameStateChanged ) {
                  return true
               } else {
                  return false
               }
            }
}
```
- The execute function returns true if the game state has changed to keep track of
 an extra draw if this dogma effect is being shared.

###Sharing State
Some cards must maintain state between individual dogma effects.  This is
accomplished by using a factory function to create the list of dogmas for a card.
This way, the execute function can be used as a closure.
```javascript
var AgricultureDogmas = function() {
   var sharedState;
   // sharedState accessed by dogma1 and dogma2
   return [ dogma1, dogma2 ]
}
```

###Player Decisions
Some cards have optional dogmas ( **you may** ... ) or allow the player to make a
decision.  This is accomplished by setting the reaction field of the player to a 
Reaction object.  

####Reaction
```javascript
{
   n: int
   list: []
   callback: function( elements ) {}
}
```
- n: number of elements from the list the player must select
- list: list containing strings representation of each option
- callback: function to be called after the player has made their selection

[the innovation card list]: http://innovation.boardgamestrategy.net/innovation-card-list/
[Mocha]: http://mochajs.org/

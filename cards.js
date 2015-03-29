var types = require( './types.js' );
var Card = function( name, age, color, topL, botL, botM, botR, dogmaSymbol, dogmas ) {
   this.name = name;
   this.age = age;
   this.color = color;
   this.symbols = { topL: topL,
                    botL: botL,
                    botM: botM,
                    botR: botR };
   this.dogmaSymbol = dogmaSymbol;
   this.dogmas = dogmas;
   this.toString = function() { return this.name };
};

var AgricultureDogmas = function() {
   return [ { demand: false,
              execute: function( game, player ) {
                           if( player.hand.length == 0 ) {
                              return false;
                           }
                           player.reaction = new types.Reaction( 1, player.hand.concat( [ null ] ),
                                                               function( cardName ) {
                                                                  if( cardName != null ) {
                                                                     var card = cards[ cardName ];
                                                                     player.removeFromHand( card );
                                                                     game.agePiles[ card.age - 1 ].unshift( card );
                                                                     game.score( player,
                                                                                 game.drawReturn( card.age + 1 ) );
                                                                     return true;
                                                                  }
                                                                  return false; } ); } } ] };
var ArcheryDogmas = function() {
   return [ { demand: true,
              execute: function( game, caller, player ) {
                 game.draw( player, 1 )
                 var highestCards = [ player.hand[ 0 ] ]
                 var highestAge = player.hand[ 0 ].age
                 for( var i = 1; i < player.hand.length; i++ ) {
                    if( player.hand[ i ].age > highestAge ) {
                       highestCards = [ player.hand[ i ] ]
                       highestAge = player.hand[ i ].age
                    } else if ( player.hand[ i ].age == highestAge ) {
                       highestCards.push( player.hand[ i ] )
                    }
                 }
                 var _exchange = function( card ) {
                    caller.hand.push( card ) 
                    player.hand.splice( player.hand.indexOf( card ), 1 )
                 }
                 if( highestCards.length == 1 ) {
                    _exchange( highestCards[ 0 ] )
                 } else {
                    player.reaction = new types.Reaction( 1, highestCards, function( card ) {
                       _exchange( cards[ card ] )
                    } )
                 }
              } } ] }
var CityStatesDogmas;
var ClothingDogmas;
var CodeOfLawsDogmas = function() {
   return [ { demand: false,
              execute: function( game, player )  {
                          var colorOnBoard = [];
                          for( var i = 0; i < 5; i++ ) {
                             colorOnBoard[ i ] = ( player.board[ i ].cards.length != 0 );
                          }
                          var cardFromHandOfSameColor = [];
                          for( var i = 0; i < player.hand.length; i++ ) {
                             if( colorOnBoard[ player.hand[ i ].color ] ) {
                                cardFromHandOfSameColor.push( player.hand[ i ] );   
                             }
                          }
                          if( cardFromHandOfSameColor.length == 0 ) {
                             return false;
                          }

                          player.reaction = new types.Reaction( 1, cardFromHandOfSameColor.concat( [ null ] ),
                               function( cardName ) {
                                  if( cardName == null ) {
                                     return false;
                                  }
                                  var card = cards[ cardName ];
                                  player.removeFromHand( card );
                                  game.tuck( player, card );
                                  player.reaction = new types.Reaction( 1, [ true, false ],
                                    function( ans ) {
                                       if( ans ) {
                                          player.board[ card.color ].splay = types.Left;
                                       }
                                    } ); 
                               } );
                          return true; } } ] };

var cards = {
      "Agriculture": new Card( "Agriculture", 1, types.Yellow, types.Hex, types.Leaf,
                            types.Leaf, types.Leaf, types.Leaf, AgricultureDogmas ),

      "Archery": new Card( "Archery", 1, types.Red, types.Castle, types.Lightbulb,
                         types.Hex, types.Castle, types.Castle, ArcheryDogmas ),
      "City States": new Card( "City States", 1, types.Purple, types.Hex, types.Crown,
                               types.Crown, types.Castle, types.Crown, [  function() {} ] ),
      "Clothing": new Card( "Clothing", 1, types.Green, types.Hex, types.Crown, types.Leaf,
                          types.Leaf, types.Leaf, [  function() {} ] ),
      "Code of Laws": new Card( "Code of Laws", 1, types.Purple, types.Hex, types.Crown,
                                types.Crown, types.Leaf, types.Crown, CodeOfLawsDogmas ),
      "Domestication": new Card( "Domestication", 1, types.Yellow, types.Castle, types.Crown,
                               types.Hex, types.Castle, types.Castle, [  function() {} ] ),
      "Masonry": new Card( "Masonry", 1, types.Yellow, types.Castle, types.Hex, types.Castle,
                         types.Castle, types.Castle, [  function() {} ] ),
      "Metalworking": new Card( "Metalworking", 1, types.Red, types.Castle, types.Castle,
                              types.Hex, types.Castle, types.Castle, [  function() {} ] ),
      "Mysticism": new Card( "Mysticism", 1, types.Purple, types.Hex, types.Castle, types.Castle,
                           types.Castle, types.Castle, [  function() {} ] ),
      "Oars": new Card( "Oars", 1, types.Red, types.Castle, types.Crown, types.Hex, types.Castle,
                      types.Castle, [  function() {} ] ),
      "Pottery": new Card( "Pottery", 1, types.Blue, types.Hex, types.Leaf, types.Leaf,
                         types.Leaf, types.Leaf, [  function() {} ] ),
      "Sailing": new Card( "Sailing", 1, types.Green, types.Crown, types.Crown, types.Hex,
                         types.Leaf, types.Crown, [  function() {} ] ),
      "The Wheel": new Card( "The Wheel", 1, types.Green, types.Hex, types.Castle,
                             types.Castle, types.Castle, types.Castle, [  function() {} ] ),
      "Tools": new Card( "Tools", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb,
                       types.Castle, types.Lightbulb, [  function() {} ] ),
      "Writing": new Card( "Writing", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb,
                         types.Crown, types.Lightbulb, [  function() {} ] ),
      "Calendar": new Card( "Calendar", 2, types.Blue, types.Hex, types.Leaf, types.Leaf, types.Lightbulb, types.Leaf, [  function() {} ] ),
      "Canal Building": new Card( "Canal Building", 2, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Crown, types.Crown, [  function() {} ] ) ,
      "Currency": new Card( "Currency", 2, types.Green, types.Leaf, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      "Construction": new Card( "Construction", 2, types.Red, types.Castle, types.Hex, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      "Fermenting": new Card( "Fermenting", 2, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      "Mapmaking": new Card( "Mapmaking", 2, types.Green, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, [  function() {} ] ) ,
      "Mathematics": new Card( "Mathematics", 2, types.Blue, types.Hex, types.Lightbulb, types.Crown, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Monotheism": new Card( "Monotheism", 2, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      "Philosophy": new Card( "Philosophy", 2, types.Purple, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Road Building": new Card( "Road Building", 2, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, [  function() {} ] ),
      "Alchemy": new Card( "Alchemy", 3, types.Blue, types.Hex, types.Leaf, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      "Compass": new Card( "Compass", 3, types.Green, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, [  function() {} ] ) ,
      "Education": new Card( "Education", 3, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Engineering": new Card( "Engineering", 3, types.Red, types.Castle, types.Hex, types.Lightbulb, types.Castle, types.Castle, [  function() {} ] ) ,
      "Feudalism": new Card( "Feudalism", 3, types.Purple, types.Hex, types.Castle, types.Leaf, types.Castle, types.Castle, [  function() {} ] ) ,
      "Machinery": new Card( "Machinery", 3, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      "Medicine": new Card( "Medicine", 3, types.Yellow, types.Crown, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      "Optics": new Card( "Optics", 3, types.Red, types.Crown, types.Crown, types.Crown, types.Hex, types.Crown, [  function() {} ] ) ,
      "Paper": new Card( "Paper", 3, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      "Translation": new Card( "Translation", 3, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ),
      "Anatomy": new Card( "Anatomy", 4, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      "Colonialism": new Card( "Colonialism", 4, types.Red, types.Hex, types.Factory, types.Lightbulb, types.Factory, types.Factory, [  function() {} ] ) ,
      "Enterprise": new Card( "Enterprise", 4, types.Purple, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Experimentation": new Card( "Experimentation", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Gunpowder": new Card( "Gunpowder", 4, types.Red, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      "Invention": new Card( "Invention", 4, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Factory, types.Lightbulb, [  function() {} ] ) ,
      "Navigation": new Card( "Navigation", 4, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Perspective": new Card( "Perspective", 4, types.Yellow, types.Hex, types.Lightbulb, types.Lightbulb, types.Leaf, types.Lightbulb, [  function() {} ] ) ,
      "Printing Press": new Card( "Printing Press", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      "Reformation": new Card( "Reformation", 4, types.Purple, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] ),
      "Astronomy": new Card( "Astronomy", 5, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Banking": new Card( "Banking", 5, types.Green, types.Factory, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      "Chemistry": new Card( "Chemistry", 5, types.Blue, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      "Coal": new Card( "Coal", 5, types.Red, types.Factory, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      "Measurement": new Card( "Measurement", 5, types.Green, types.Lightbulb, types.Leaf, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Physics": new Card( "Physics", 5, types.Blue, types.Factory, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Societies": new Card( "Societies", 5, types.Purple, types.Crown, types.Hex, types.Lightbulb, types.Crown, types.Crown, [  function() {} ] ) ,
      "Statistics": new Card( "Statistics", 5, types.Yellow, types.Leaf, types.Lightbulb, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      "Steam Engine": new Card( "Steam Engine", 5, types.Yellow, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      "The Pirate Code": new Card( "The Pirate Code", 5, types.Red, types.Crown, types.Factory, types.Crown, types.Hex, types.Crown, [  function() {} ] ),
      "Atomic Theory": new Card( "Atomic Theory", 6, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Canning": new Card( "Canning", 6, types.Yellow, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      "Classification": new Card( "Classification", 6, types.Green, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Democracy": new Card( "Democracy", 6, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Emancipation": new Card( "Emancipation", 6, types.Purple, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      "Encyclopedia": new Card( "Encyclopedia", 6, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Industrialization": new Card( "Industrialization", 6, types.Red, types.Crown, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      "Machine Tools": new Card( "Machine Tools", 6, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      "Metric System": new Card( "Metric System", 6, types.Green, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Vaccination": new Card( "Vaccination", 6, types.Yellow, types.Leaf, types.Factory, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ),
      "Bicycle": new Card( "Bicycle", 7, types.Green, types.Crown, types.Crown, types.Clock, types.Hex, types.Crown, [  function() {} ] ) ,
      "Combustion": new Card( "Combustion", 7, types.Red, types.Crown, types.Crown, types.Factory, types.Hex, types.Crown, [  function() {} ] ) ,
      "Electricity": new Card( "Electricity", 7, types.Green, types.Lightbulb, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      "Evolution": new Card( "Evolution", 7, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Explosives": new Card( "Explosives", 7, types.Red, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      "Lighting": new Card( "Lighting", 7, types.Purple, types.Hex, types.Leaf, types.Clock, types.Leaf, types.Leaf, [  function() {} ] ) ,
      "Publications": new Card( "Publications", 7, types.Blue, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Railroad": new Card( "Railroad", 7, types.Purple, types.Clock, types.Factory, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Refrigeration": new Card( "Refrigeration", 7, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Crown, types.Leaf, [  function() {} ] ) ,
      "Sanitation": new Card( "Sanitation", 7, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] ),
      "Antibiotics": new Card( "Antibiotics", 8, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      "Corporations": new Card( "Corporations", 8, types.Green, types.Hex, types.Factory, types.Factory, types.Crown, types.Factory, [  function() {} ] ) ,
      "Empiricism": new Card( "Empiricism", 8, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Flight": new Card( "Flight", 8, types.Red, types.Crown, types.Hex, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      "Mass Media": new Card( "Mass Media", 8, types.Green, types.Lightbulb, types.Hex, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Mobility": new Card( "Mobility", 8, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      "Quantum Theory": new Card( "Quantum Theory", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Rocketry": new Card( "Rocketry", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Skyscrapers": new Card( "Skyscrapers", 8, types.Yellow, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Socialism": new Card( "Socialism", 8, types.Purple, types.Leaf, types.Hex, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ),
      "Collaboration": new Card( "Collaboration", 9, types.Green, types.Hex, types.Crown, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      "Composites": new Card( "Composites", 9, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      "Computers": new Card( "Computers", 9, types.Blue, types.Clock, types.Hex, types.Clock, types.Factory, types.Clock, [  function() {} ] ) ,
      "Ecology": new Card( "Ecology", 9, types.Yellow, types.Leaf, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Fission": new Card( "Fission", 9, types.Red, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      "Genetics": new Card( "Genetics", 9, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      "Satellites": new Card( "Satellites", 9, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      "Services": new Card( "Services", 9, types.Purple, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      "Specialization": new Card( "Specialization", 9, types.Purple, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      "Suburbia": new Card( "Suburbia", 9, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ),
      "A.I.": new Card( "A.I.", 10, types.Purple, types.Lightbulb, types.Lightbulb, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Bioengineering": new Card( "Bioengineering", 10, types.Blue, types.Lightbulb, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Databases": new Card( "Databases", 10, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      "Globalization": new Card( "Globalization", 10, types.Yellow, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      "Miniaturization": new Card( "Miniaturization", 10, types.Red, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      "Robotics": new Card( "Robotics", 10, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      "Self Service": new Card( "Self Service", 10, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      "Software": new Card( "Software", 10, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      "Stem Cells": new Card( "Stem Cells", 10, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      "The Internet": new Card( "The Internet", 10, types.Purple, types.Hex, types.Clock, types.Clock, types.Lightbulb, types.Clock, [  function() {} ] )
}
exports.Cards = cards;

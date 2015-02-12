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
   // setup state needed in effect functions
   return [ { demand: false,
              execute: function( game, player ) {
                           if( player.hand.length == 0 ) {
                              return;
                           }
                           player.reaction = new types.Reaction( 1, player.hand.concat( [ null ] ),
                                                               function( card ) {
                                                                  if( card != null ) {
                                                                     player.removeCard( card.name );
                                                                     game.agePiles[ card.age - 1 ].unshift( card );
                                                                     player.score( game.drawCard( card.age + 1 ) );
                                                                  }
                                                                  return card == null; } ) } } ] };

exports.agePiles = [
   [
      new Card( "Agriculture", 1, types.Yellow, types.Hex, types.Leaf,
                types.Leaf, types.Leaf, types.Leaf, AgricultureDogmas ),

      new Card( "Archery", 1, types.Red, types.Castle, types.Lightbulb, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "City States", 1, types.Purple, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, [  function() {} ] ) ,
      new Card( "Clothing", 1, types.Green, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new Card( "Code of Laws", 1, types.Purple, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, [  function() {} ] ) ,
      new Card( "Domestication", 1, types.Yellow, types.Castle, types.Crown, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Masonry", 1, types.Yellow, types.Castle, types.Hex, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Metalworking", 1, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Mysticism", 1, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Oars", 1, types.Red, types.Castle, types.Crown, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Pottery", 1, types.Blue, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new Card( "Sailing", 1, types.Green, types.Crown, types.Crown, types.Hex, types.Leaf, types.Crown, [  function() {} ] ) ,
      new Card( "The Wheel", 1, types.Green, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Tools", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Castle, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Writing", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] )
   ], [
      new Card( "Calendar", 2, types.Blue, types.Hex, types.Leaf, types.Leaf, types.Lightbulb, types.Leaf, [  function() {} ] ) ,
      new Card( "Canal Building", 2, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Currency", 2, types.Green, types.Leaf, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Construction", 2, types.Red, types.Castle, types.Hex, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Fermenting", 2, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      new Card( "Mapmaking", 2, types.Green, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, [  function() {} ] ) ,
      new Card( "Mathematics", 2, types.Blue, types.Hex, types.Lightbulb, types.Crown, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Monotheism", 2, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Philosophy", 2, types.Purple, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Road Building", 2, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, [  function() {} ] )
   ], [
      new Card( "Alchemy", 3, types.Blue, types.Hex, types.Leaf, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Compass", 3, types.Green, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, [  function() {} ] ) ,
      new Card( "Education", 3, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Engineering", 3, types.Red, types.Castle, types.Hex, types.Lightbulb, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Feudalism", 3, types.Purple, types.Hex, types.Castle, types.Leaf, types.Castle, types.Castle, [  function() {} ] ) ,
      new Card( "Machinery", 3, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      new Card( "Medicine", 3, types.Yellow, types.Crown, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new Card( "Optics", 3, types.Red, types.Crown, types.Crown, types.Crown, types.Hex, types.Crown, [  function() {} ] ) ,
      new Card( "Paper", 3, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Translation", 3, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] )
   ], [
      new Card( "Anatomy", 4, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new Card( "Colonialism", 4, types.Red, types.Hex, types.Factory, types.Lightbulb, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Enterprise", 4, types.Purple, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Experimentation", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Gunpowder", 4, types.Red, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Invention", 4, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Factory, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Navigation", 4, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Perspective", 4, types.Yellow, types.Hex, types.Lightbulb, types.Lightbulb, types.Leaf, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Printing Press", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Reformation", 4, types.Purple, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] )
   ], [
      new Card( "Astronomy", 5, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Banking", 5, types.Green, types.Factory, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Chemistry", 5, types.Blue, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new Card( "Coal", 5, types.Red, types.Factory, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new Card( "Measurement", 5, types.Green, types.Lightbulb, types.Leaf, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Physics", 5, types.Blue, types.Factory, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Societies", 5, types.Purple, types.Crown, types.Hex, types.Lightbulb, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Statistics", 5, types.Yellow, types.Leaf, types.Lightbulb, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new Card( "Steam Engine", 5, types.Yellow, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "The Pirate Code", 5, types.Red, types.Crown, types.Factory, types.Crown, types.Hex, types.Crown, [  function() {} ] )
   ], [
      new Card( "Atomic Theory", 6, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Canning", 6, types.Yellow, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Classification", 6, types.Green, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Democracy", 6, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Emancipation", 6, types.Purple, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new Card( "Encyclopedia", 6, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Industrialization", 6, types.Red, types.Crown, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new Card( "Machine Tools", 6, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Metric System", 6, types.Green, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Vaccination", 6, types.Yellow, types.Leaf, types.Factory, types.Leaf, types.Hex, types.Leaf, [  function() {} ] )
   ], [
      new Card( "Bicycle", 7, types.Green, types.Crown, types.Crown, types.Clock, types.Hex, types.Crown, [  function() {} ] ) ,
      new Card( "Combustion", 7, types.Red, types.Crown, types.Crown, types.Factory, types.Hex, types.Crown, [  function() {} ] ) ,
      new Card( "Electricity", 7, types.Green, types.Lightbulb, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Evolution", 7, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Explosives", 7, types.Red, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Lighting", 7, types.Purple, types.Hex, types.Leaf, types.Clock, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new Card( "Publications", 7, types.Blue, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Railroad", 7, types.Purple, types.Clock, types.Factory, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Refrigeration", 7, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Crown, types.Leaf, [  function() {} ] ) ,
      new Card( "Sanitation", 7, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] )
   ], [
      new Card( "Antibiotics", 8, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new Card( "Corporations", 8, types.Green, types.Hex, types.Factory, types.Factory, types.Crown, types.Factory, [  function() {} ] ) ,
      new Card( "Empiricism", 8, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Flight", 8, types.Red, types.Crown, types.Hex, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Mass Media", 8, types.Green, types.Lightbulb, types.Hex, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Mobility", 8, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Quantum Theory", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Rocketry", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Skyscrapers", 8, types.Yellow, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Socialism", 8, types.Purple, types.Leaf, types.Hex, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] )
   ], [
      new Card( "Collaboration", 9, types.Green, types.Hex, types.Crown, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Composites", 9, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Computers", 9, types.Blue, types.Clock, types.Hex, types.Clock, types.Factory, types.Clock, [  function() {} ] ) ,
      new Card( "Ecology", 9, types.Yellow, types.Leaf, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Fission", 9, types.Red, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new Card( "Genetics", 9, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Satellites", 9, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new Card( "Services", 9, types.Purple, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new Card( "Specialization", 9, types.Purple, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Suburbia", 9, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] )
   ], [
      new Card( "A.I.", 10, types.Purple, types.Lightbulb, types.Lightbulb, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Bioengineering", 10, types.Blue, types.Lightbulb, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Databases", 10, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new Card( "Globalization", 10, types.Yellow, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Miniaturization", 10, types.Red, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new Card( "Robotics", 10, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      new Card( "Self Service", 10, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new Card( "Software", 10, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new Card( "Stem Cells", 10, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new Card( "The Internet", 10, types.Purple, types.Hex, types.Clock, types.Clock, types.Lightbulb, types.Clock, [  function() {} ] )
   ]
]

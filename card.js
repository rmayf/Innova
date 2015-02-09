var types = require( './types.js' );
exports.agePiles = [ function() { return [
      new types.Card( "Agriculture", 1, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [ function( game, player ) {
         if( player.hand.length === 0 ) {
            return;
         }
         player.chooseOne( player.hand.concat( [ null ] ),
                                 function( card ) {
                                    if( card ) {
                                       player.removetypes.Card( card );
                                       game.agePiles[ card.age ].push( card );
                                       player.score.append[ game.drawtypes.Card( card.age + 1 ) ];
                                    }
                                 } );
      } ] ),
      new types.Card( "Archery", 1, types.Red, types.Castle, types.Lightbulb, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "City States", 1, types.Purple, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, [  function() {} ] ) ,
      new types.Card( "Clothing", 1, types.Green, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Code of Laws", 1, types.Purple, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, [  function() {} ] ) ,
      new types.Card( "Domestication", 1, types.Yellow, types.Castle, types.Crown, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Masonry", 1, types.Yellow, types.Castle, types.Hex, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Metalworking", 1, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Mysticism", 1, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Oars", 1, types.Red, types.Castle, types.Crown, types.Hex, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Pottery", 1, types.Blue, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Sailing", 1, types.Green, types.Crown, types.Crown, types.Hex, types.Leaf, types.Crown, [  function() {} ] ) ,
      new types.Card( "The Wheel", 1, types.Green, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Tools", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Castle, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Writing", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Calendar", 2, types.Blue, types.Hex, types.Leaf, types.Leaf, types.Lightbulb, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Canal Building", 2, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Currency", 2, types.Green, types.Leaf, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Construction", 2, types.Red, types.Castle, types.Hex, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Fermenting", 2, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Mapmaking", 2, types.Green, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, [  function() {} ] ) ,
      new types.Card( "Mathematics", 2, types.Blue, types.Hex, types.Lightbulb, types.Crown, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Monotheism", 2, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Philosophy", 2, types.Purple, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Road Building", 2, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Alchemy", 3, types.Blue, types.Hex, types.Leaf, types.Castle, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Compass", 3, types.Green, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, [  function() {} ] ) ,
      new types.Card( "Education", 3, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Engineering", 3, types.Red, types.Castle, types.Hex, types.Lightbulb, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Feudalism", 3, types.Purple, types.Hex, types.Castle, types.Leaf, types.Castle, types.Castle, [  function() {} ] ) ,
      new types.Card( "Machinery", 3, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Medicine", 3, types.Yellow, types.Crown, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Optics", 3, types.Red, types.Crown, types.Crown, types.Crown, types.Hex, types.Crown, [  function() {} ] ) ,
      new types.Card( "Paper", 3, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Translation", 3, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] )
   ] },
   function() { return [
      new types.Card( "Anatomy", 4, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Colonialism", 4, types.Red, types.Hex, types.Factory, types.Lightbulb, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Enterprise", 4, types.Purple, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Experimentation", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Gunpowder", 4, types.Red, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Invention", 4, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Factory, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Navigation", 4, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Perspective", 4, types.Yellow, types.Hex, types.Lightbulb, types.Lightbulb, types.Leaf, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Printing Press", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Reformation", 4, types.Purple, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Astronomy", 5, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Banking", 5, types.Green, types.Factory, types.Crown, types.Hex, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Chemistry", 5, types.Blue, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new types.Card( "Coal", 5, types.Red, types.Factory, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new types.Card( "Measurement", 5, types.Green, types.Lightbulb, types.Leaf, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Physics", 5, types.Blue, types.Factory, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Societies", 5, types.Purple, types.Crown, types.Hex, types.Lightbulb, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Statistics", 5, types.Yellow, types.Leaf, types.Lightbulb, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Steam Engine", 5, types.Yellow, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "The Pirate Code", 5, types.Red, types.Crown, types.Factory, types.Crown, types.Hex, types.Crown, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Atomic Theory", 6, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Canning", 6, types.Yellow, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Classification", 6, types.Green, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Democracy", 6, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Emancipation", 6, types.Purple, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new types.Card( "Encyclopedia", 6, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Industrialization", 6, types.Red, types.Crown, types.Factory, types.Factory, types.Hex, types.Factory, [  function() {} ] ) ,
      new types.Card( "Machine Tools", 6, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Metric System", 6, types.Green, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Vaccination", 6, types.Yellow, types.Leaf, types.Factory, types.Leaf, types.Hex, types.Leaf, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Bicycle", 7, types.Green, types.Crown, types.Crown, types.Clock, types.Hex, types.Crown, [  function() {} ] ) ,
      new types.Card( "Combustion", 7, types.Red, types.Crown, types.Crown, types.Factory, types.Hex, types.Crown, [  function() {} ] ) ,
      new types.Card( "Electricity", 7, types.Green, types.Lightbulb, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Evolution", 7, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Explosives", 7, types.Red, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Lighting", 7, types.Purple, types.Hex, types.Leaf, types.Clock, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Publications", 7, types.Blue, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Railroad", 7, types.Purple, types.Clock, types.Factory, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Refrigeration", 7, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Crown, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Sanitation", 7, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Antibiotics", 8, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Corporations", 8, types.Green, types.Hex, types.Factory, types.Factory, types.Crown, types.Factory, [  function() {} ] ) ,
      new types.Card( "Empiricism", 8, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Flight", 8, types.Red, types.Crown, types.Hex, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Mass Media", 8, types.Green, types.Lightbulb, types.Hex, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Mobility", 8, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Quantum Theory", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Rocketry", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Skyscrapers", 8, types.Yellow, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Socialism", 8, types.Purple, types.Leaf, types.Hex, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "Collaboration", 9, types.Green, types.Hex, types.Crown, types.Clock, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Composites", 9, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Computers", 9, types.Blue, types.Clock, types.Hex, types.Clock, types.Factory, types.Clock, [  function() {} ] ) ,
      new types.Card( "Ecology", 9, types.Yellow, types.Leaf, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Fission", 9, types.Red, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new types.Card( "Genetics", 9, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Satellites", 9, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new types.Card( "Services", 9, types.Purple, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new types.Card( "Specialization", 9, types.Purple, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Suburbia", 9, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] )
   ]; },
   function() { return [
      new types.Card( "A.I.", 10, types.Purple, types.Lightbulb, types.Lightbulb, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Bioengineering", 10, types.Blue, types.Lightbulb, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Databases", 10, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, [  function() {} ] ) ,
      new types.Card( "Globalization", 10, types.Yellow, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Miniaturization", 10, types.Red, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, [  function() {} ] ) ,
      new types.Card( "Robotics", 10, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, [  function() {} ] ) ,
      new types.Card( "Self Service", 10, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, [  function() {} ] ) ,
      new types.Card( "Software", 10, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, [  function() {} ] ) ,
      new types.Card( "Stem Cells", 10, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, [  function() {} ] ) ,
      new types.Card( "The Internet", 10, types.Purple, types.Hex, types.Clock, types.Clock, types.Lightbulb, types.Clock, [  function() {} ] )
   ]; }
]

#!/usr/local/bin/node
var engine = require( '../engine' );
var types = require( '../types' );
var cards = require( '../cards' ).Cards;
var expect = require( 'chai' ).expect;

var players
function initGame( setup ) {
   for( var i = 0; i < players.length; i++ ) {
      var player = players[ i ]
      player.actions = 0
      player.perform = false
      player.reaction = null
      player.hand = []
      if( setup[ i ] ) {
         if( setup[ i ].hand != null ) {
            for( var j = 0; j < setup[ i ].hand.length; j++ ) {
               var card = setup[ i ].hand[ j ]
               player.hand.push( cards[ card ] )
            }
         }
         if( setup[ i ].board != null ) {
            for( var j = 0; j < setup[ i ].board.length; j++ ) {
               var card = setup[ i ].board[ j ]
               game.meld( player, cards[ card ] )
            }
         }
      }
   }
   game.turn = 1
   players[ 0 ].actions = 2
   players[ 0 ].perform = true
}

var game
var player1
var player2
beforeEach( function() {
   game = new engine.Game( 2, 6, function( e ) {
      if( e ) {
         throw e; 
      }
   } ); 
   game.begin( [ 'bob', 'janice' ] );
   player1 = game.players[ 0 ];
   player2 = game.players[ 1 ];
   players = []
   players.push( player1 )
   players.push( player2 )
} )

describe( 'Agriculture', function() {
   var dogma;
   beforeEach( 'player1 melds agriculture', function() {
      var ag = cards[ 'Agriculture' ];
      game.meld( player1, ag );
      dogma = ag.dogmas()[ 0 ].execute; 
      player1.hand = [];
   } )
   it( 'has no effect when nothing in hand', function() {
      dogma( game, player1 );
      expect( player1.scoreCards ).to.be.empty;
      expect( player1.hand ).to.be.empty;
   } )
   it( 'creates reaction for player', function() {
      player1.reaction = null;
      player1.hand.push( game.agePiles[ 0 ].pop() );
      dogma( game, player1 );
      expect( player1.reaction ).to.not.be.null;
      expect( player1.reaction.n ).to.equal( 1 );
      expect( player1.reaction.list ).to.have.length( 2 );
   } )
   it( 'returns, draws, and scores in callback', function() {
      var card = game.agePiles[ 2 ].pop();
      player1.hand.push( card );
      dogma( game, player1 );
      player1.reaction.callback( card );
      expect( player1.scoreCards[ 0 ].age ).to.equal( 4 );
      expect( player1.score() ).to.equal( 4 );
      expect( player1.hand ).to.be.empty;
      expect( game.agePiles[ 2 ][ 0 ] ).to.be.eql( card );
   } )
   it( 'allows any card in hand to be selected', function() {
      var age2Card = game.agePiles[ 1 ].pop();
      var age9Card = game.agePiles[ 8 ].pop();
      player1.hand.splice( 0, 0, age2Card, age9Card );
      dogma( game, player1 );
      game.reaction( player1.name, age9Card.name );
      expect( player1.score() ).to.equal( 10 );
   } )
   it( 'allows player to decline', function() {
      player1.hand.push( game.agePiles[ 0 ].pop() );
      dogma( game, player1 );
      game.reaction( player1.name, null );
      expect( player1.score() ).to.equal( 0 );
   } )
} )

describe( 'Archery', function() {
   describe( 'callee has no cards', function() {
      beforeEach( function() {
         player1.hand = []
         player2.hand = []
         player2.reaction = null
         var dogmas = cards[ 'Archery' ].dogmas() 
         dogmas[ 0 ].execute( game, player1, player2 )
      } )
      it( 'caller has one age 1 card', function() {
         expect( player1.hand.length ).to.equal( 1 )
      } )
      it( 'callee still has no cards', function() {
         expect( player2.hand.length ).to.equal( 0 )
      } )
   } )
   describe( 'callee has higher age card', function() {
      beforeEach( function() {
         player1.hand = []
         player2.hand = [ game.agePiles[ 2 ][ 0 ] ]
         var dogmas = cards[ 'Archery' ].dogmas() 
         dogmas[ 0 ].execute( game, player1, player2 )
      } )
      it( 'caller has age 3 card', function() {
         expect( player1.hand[ 0 ].age ).to.equal( 3 )
      } )
      it( 'callee has age 1 card', function() {
         expect( player2.hand[ 0 ].age ).to.equal( 1 )
      } )
   } )
   describe( 'callee has multiple age 1 cards', function() {
      beforeEach( function() {
         player1.hand = []
         player2.hand = player2.hand.concat( game.agePiles[ 2 ].slice( 0, 2 ) )
         var dogmas = cards[ 'Archery' ].dogmas() 
         dogmas[ 0 ].execute( game, player1, player2 )
      } )
      it( 'callee reaction is expected', function() {
         expect( player2.reaction ).to.not.be.null;
         expect( player2.reaction.list.length ).to.equal( 2 );
      } )
      it( 'callback behaves', function() {
         var cardName = player2.reaction.list[ 0 ].name
         player2.reaction.callback( cardName )
         expect( player1.hand[ 0 ].name ).to.equal( cardName )
         expect( player2.hand.length ).to.equal( 4 )
      } )
   } )
} )

describe( 'City States', function() {
   var dogma;
   beforeEach( function() {
      dogma = cards[ 'City States' ].dogmas()[ 0 ]
      game.meld( player2, cards[ 'Masonry' ] )
   } )
   it( 'callee has less than 4 castles', function() {
      dogma.execute( game, player1, player2 )
      expect( player2.board[ types.Yellow ].cards.length ).to.equal( 1 )
      expect( player1.board[ types.Yellow ].cards.length ).to.equal( 0 )
   } )
   it( 'callee is effected', function() {
      game.meld( player2, cards[ 'Archery' ] )
      player2.reaction = null
      dogma.execute( game, player1, player2 )
      expect( player2.reaction ).to.not.be.null
      expect( player2.perform ).to.be.true
      expect( player2.reaction.n ).to.equal( 1 )
      expect( player2.reaction.list.length ).to.equal( 2 )
      var selectedCard = cards[ player2.reaction.list[ 0 ] ]
      player2.reaction.callback( selectedCard.name )
      expect( player2.board[ selectedCard.color ].cards.length ).to.equal( 0 )
      expect( player1.board[ selectedCard.color ].cards.length ).to.equal( 1 )
      expect( player1.board[ selectedCard.color ].cards[ 0 ] ).to.equal( selectedCard )
   } )
} )

describe( 'Clothing', function() {
   beforeEach( function() {
      initGame( [
                  {
                     hand: [ "Sailing", "Agriculture", "Archery" ],
                     board: [ "Clothing" ]
                  },
                  {
                     hand: [],
                     board: [ "Oars" ]
                  }
               ]
      )
      game.action( player1.name, 'dogma', 'Clothing' ) 
   } )
   it( 'Executing dogma produces correct state', function() {
      expect( player1.reaction ).to.not.be.null
      expect( player1.perform ).to.be.true
      expect( player2.perform ).to.be.false
   } )
   it( 'Reaction has the correct list of cards', function() {
      expect( player1.reaction.n ).to.equal( 1 )
      expect( player1.callback ).to.not.be.null
      expect( player1.hand ).to.contain( cards[ "Archery" ] )
      expect( player1.hand ).to.contain( cards[ "Agriculture" ] )
   } )
   it( 'Callback works', function() {
      game.reaction( player1.name, 'Archery' )
      expect( player1.hand ).to.not.contain( "Archery" )
      expect( player1.board[ types.Red ].cards ).to.contain( cards[ 'Archery' ] )
   } )
   it( 'Second effect works', function() {
      game.reaction( player1.name, 'Archery' )
      expect( player1.score() ).to.equal( 1 )
      expect( player2.score() ).to.equal( 0 )
   } )
} )
describe( 'Code of Laws', function() {
   var dogma;
   beforeEach( function() {
      var card = cards[ 'Code of Laws' ];
      dogma = card.dogmas()[ 0 ].execute;
      var calendar = cards[ 'Calendar' ];
      game.meld( player1, calendar );
      player1.hand = [];
   } )
   it( 'returns correct list of cards', function() {
      var writing = cards[ 'Writing' ];
      player1.hand.push( writing );
      dogma( game, player1 );
      expect( player1.reaction.list ).to.have.length( 2 );
      expect( player1.reaction.list ).to.contain( writing );
   } )
   it( 'allows player to tuck', function() {
      var tools = cards[ 'Tools' ];
      player1.hand.push( tools );
      player1.hand.push( cards[ 'Writing' ] );
      dogma( game, player1 );
      game.reaction( player1.name, tools.name );
      expect( player1.board[ types.Blue ].cards[ 1 ] ).to.equal( tools );
      expect( player1.reaction ).to.not.be.null;
   } )
   it( 'allows player to splay', function() {
      var tools = cards[ 'Tools' ];
      player1.hand.push( tools );
      player1.hand.push( cards[ 'Writing' ] );
      dogma( game, player1 );
      game.reaction( player1.name, tools.name );
      expect( player1.board[ types.Blue ].splay ).to.equal( types.None ); 
      game.reaction( player1.name, true );
      expect( player1.board[ types.Blue ].splay ).to.equal( types.Left ); 
   } )
} )
describe( 'Domestication', function() {
   var dogma
   beforeEach( function() {
      var domestication = cards[ 'Domestication' ]
      dogma = domestication.dogmas()[ 0 ].execute
      game.meld( player1, domestication )
      player1.hand = [ cards[ 'Agriculture' ], cards[ 'Archery' ] ]
   } )
   it( 'meld card from hand of different color, draw 1', function() {
      dogma( game, player1 )
      game.reaction( player1.name, 'Archery' )
      expect( player1.hand.length ).to.equal( 2 )
      expect( player1.board[ types.Red ].cards.length ).to.equal( 1 )
      expect( player1.board[ types.Red ].cards[ 0 ].name ).to.equal( 'Archery' )
   } )
   it( 'meld yellow card from hand, draw 1', function() {
      dogma( game, player1 )
      game.reaction( player1.name, 'Agriculture' )
      expect( player1.board[ types.Yellow ].cards[ 0 ].name ).to.equal( 'Agriculture' )
   } )
   it( 'must meld lowest card', function() {
      player1.hand.push( cards[ 'Calendar' ] )
      dogma( game, player1 )
      expect( player1.reaction.list.length ).to.equal( 2 )
   } )
   it( 'still draw even when hand can\'t meld', function() {
      player1.hand = []
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
   } )
} )
describe( 'Masonry', function() {
   var dogma
   beforeEach( function() {
      var masonry = cards[ 'Masonry' ] 
      game.meld( player1, masonry )
      dogma = masonry.dogmas()[ 0 ].execute
      player1.hand = [ cards[ 'Agriculture' ], cards[ 'Archery' ], cards[ 'Domestication' ], cards[ 'Metalworking' ], cards[ 'Mysticism' ] ]
   } )
   it( 'reaction selects only castle cards', function() {
      dogma( game, player1 )
      expect( player1.reaction ).to.not.be.null
      expect( player1.reaction.list.length ).to.equal( 4 )
   } )
   it( 'can meld a card', function() {
      dogma( game, player1 )
      game.reaction( player1.name, [ 'Archery' ] )
      expect( player1.hand.length ).to.equal( 4 )
      expect( player1.achievements.length ).to.equal( 0 )
      expect( player1.board[ types.Red ].cards.length ).to.equal( 1 )
      expect( player1.board[ types.Red ].cards[ 0 ].name ).to.equal( 'Archery' )
   } )
   it( 'melds in correct order', function() {
      dogma( game, player1 )
      game.reaction( player1.name, [ 'Archery', 'Metalworking' ] )
      expect( player1.board[ types.Red ].cards[ 0 ].name ).to.equal( 'Metalworking' )
   } )
   it( 'meld 4 or more gains achievement', function() {
      dogma( game, player1 )
      game.reaction( player1.name, [ 'Archery', 'Metalworking', 'Domestication', 'Mysticism' ] )
      expect( player1.achievements[ 0 ].name ).to.equal( 'Monument' )
   } )
} )
describe( 'Metalworking', function() {
   var dogma
   beforeEach( function() {
      var metalworking = cards[ 'Metalworking' ]
      dogma = metalworking.dogmas()[ 0 ].execute
      player1.hand = []
   } )
   it( 'first card is non-castle', function() {
      game.agePiles[ 0 ] = [ cards[ 'Agriculture' ] ]
      dogma( game, player1 )
      expect( player1.score() ).to.equal( 0 )
      expect( player1.scoreCards.length ).to.equal( 0 )
      expect( player1.hand.length ).to.equal( 1 )
   } )
   it( 'Score castle and repeat', function() {
      game.agePiles[ 0 ] = [ cards[ 'Clothing' ], cards[ 'City States' ], cards[ 'Archery' ] ]
      dogma( game, player1 )
      expect( player1.scoreCards.length ).to.equal( 2 )
      expect( player1.hand.length ).to.equal( 1 )
   } )
   it( 'stop after non castle', function() {
      game.agePiles[ 0 ] = [ cards[ 'Archery' ], cards[ 'Agriculture' ] ]
      dogma( game, player1 )
      expect( player1.scoreCards.length ).to.equal( 0 )
   } )
} )
describe( 'Mysticism', function() {
   var dogma
   beforeEach( function() {
      var mysticism = cards[ 'Mysticism' ]
      dogma = mysticism.dogmas()[ 0 ].execute
      game.meld( player1, mysticism )
      player1.hand = []
   } )
   it( 'drawn card\'s color not on board', function() {
      game.agePiles[ 0 ] = [ cards[ 'Agriculture' ] ]
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
      expect( player1.board[ types.Yellow ].cards.length ).to.equal( 0 )
   } )
   it( 'drawn card is same color as card on board', function() {
      game.agePiles[ 0 ] = [ cards[ 'Agriculture' ], cards[ 'City States' ] ]
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
      expect( player1.hand[ 0 ].name ).to.equal( 'Agriculture' )
      expect( player1.board[ types.Purple ].cards.length ).to.equal( 2 )
      expect( player1.board[ types.Purple ].cards[ 0 ].name ).to.equal( 'City States' )
   } )
} )
describe( 'Oars', function() {
   var demand
   var dogma
   beforeEach( function() {
      var oars = cards[ 'Oars' ]
      var dogmas = oars.dogmas()
      demand = dogmas[ 0 ].execute
      dogma = dogmas[ 1 ].execute
      player1.hand = []
      player2.hand = []
      game.meld( player1, oars )
      game.agePiles[ 0 ].push( cards[ 'Oars' ] )
   } )
   it( 'no crown cards', function() {
      demand( game, player1, player2 )
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
   } )
   it( 'selects only crown cards', function() {
      player2.hand = [ cards[ 'Agriculture' ], cards[ 'City States' ], cards[ 'Clothing' ] ]
      demand( game, player1, player2 )
      expect( player2.reaction.list.length ).to.equal( 2 )
   } )
   it( 'card is successfully xfered and callee draws card', function() {
      player2.hand = [ cards[ 'Agriculture' ], cards[ 'City States' ], cards[ 'Clothing' ] ]
      demand( game, player1, player2 )
      game.reaction( player2.name, 'Clothing' )
      expect( player1.scoreCards.length ).to.equal( 1 )
      expect( player1.scoreCards[ 0 ].name ).to.equal( 'Clothing' )
      expect( player1.hand.length ).to.equal( 0 )
      expect( player2.hand.length ).to.equal( 3 )
      expect( player2.hand ).to.not.contain( cards[ 'Clothing' ] )
   } )
   it( '2nd effect only works when no card is xferred', function() {
      player2.hand = [ cards[ 'Agriculture' ], cards[ 'City States' ], cards[ 'Clothing' ] ]
      demand( game, player1, player2 )
      game.reaction( player2.name, 'Clothing' )
      dogma( game, player1 ) 
      expect( player1.hand.length ).to.equal( 0 )
   } )
} )
describe( 'Pottery', function() {
   var dogma1
   var dogma2
   beforeEach( function() {
      var pottery = cards[ 'Pottery' ]
      var dogmas = pottery.dogmas()
      dogma1 = dogmas[ 0 ].execute
      dogma2 = dogmas[ 1 ].execute
      player1.hand = [ cards[ 'Agriculture' ], cards[ 'Oars' ], cards[ 'Metalworking' ],
                       cards[ 'Sailing' ] ]
   } )
   it( 'Reaction has correct state', function() {
      dogma1( game, player1 )
      expect( player1.reaction.n ).to.equal( '<=3' )
      expect( player1.reaction.list ).to.equal( player1.hand )
   } )
   it( 'Draw card equal to number returned', function() {
      dogma1( game, player1 )
      game.reaction( player1.name, [ 'Oars', 'Metalworking', 'Sailing' ] )
      expect( player1.hand ).to.contain( cards[ 'Agriculture' ] )
      expect( player1.scoreCards.length ).to.equal( 1 )
      expect( player1.scoreCards[ 0 ].age ).to.equal( 3 )
   } )
   it( 'Second dogma works', function() {
      dogma2( game, player1 )
      expect( player1.hand.length ).to.equal( 5 )
   } )
} )
describe( 'Sailing', function() {
   var dogma
   beforeEach( function() {
      var card = cards[ 'Sailing' ]
      dogma = card.dogmas()[ 0 ].execute
      game.agePiles[ 0 ].push( cards[ 'Agriculture' ] )
   } )
   it( 'Draws and melds', function() {
      dogma( game, player1 )
      expect( player1.board[ types.Yellow ].cards.length ).to.equal( 1 )
      expect( player1.board[ types.Yellow ].cards[ 0 ] ).to.equal( cards[ 'Agriculture' ] )
   } )
} )
describe( 'The Wheel', function() {
   var dogma
   beforeEach( function() {
      var card = cards[ 'The Wheel' ]
      dogma = card.dogmas()[ 0 ].execute
   } )
   it( 'Player draws two age 1 cards', function() {
      var ret = dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 4 )
      expect( ret ).to.be.true
   } )
} )
describe( 'Tools', function() {
   var returnThreeCards
   var returnAThree
   var age3Card = 'Alchemy'
   beforeEach( function() {
      initGame( [
                  {
                     hand: [ age3Card, "Agriculture", "Archery" ],
                  }
               ]
      )
      var card = cards[ 'Tools' ]
      return3Cards = card.dogmas()[ 0 ].execute
      returnAThree = card.dogmas()[ 1 ].execute
   } )
   it( 'Return 3 cards', function() {
      return3Cards( game, player1 )
      expect( player1.reaction ).to.be.not.null()
      expect( player1.reaction.list.length ).to.equal( 3 )
      expect( player1.reaction.callback( player1.hand.slice() ) ).to.be.true
      expect( player1.hand.length ).to.equal( 0 )
      // Add all stack lengths of board together, should equal 1
      expect( player1.board.length() ).to.equal( 1 )
      // Check if card melded is a 3
      for( var i = new types.ColorIterator(); i.valid(); i.next() ) {
         var cards = player1.board[ i.value() ].cards
         if( cards.length > 0) {
            expect( cards[ 0 ].age ).to.equal( 3 )
         }
      }
   } )
   it( 'Return less than 3 cards', function() {
      return3Cards( game, player1 )
      returnCards = player1.hand.slice()
      // [ "Ag", "Arch" ]
      expect( player1.reaction.callback( returnCards.slice( 1 ) ) ).to.be.true
      // No 3 melded
      expect( player1.board.length() ).to.equal( 0 )

   } )
   it( 'Return no cards', function() {
      return3Cards( game, player1 )
      expect( player1.reaction.callback( [] ) ).to.be.false
   } )
   it( 'Have no cards', function() {
      player1.hand = []
      var res = return3Cards( game, player1 )
      expect( player1.reaction ).to.be.null
      expect( res ).to.be.false
   } )
   it( 'Return a 3', function() {
      returnAThree( game, player1 )
      expect( player1.reaction ).to.not.be.null
      expect( player1.reaction.list.length ).to.equal( 2 )
      expect( player1.reaction.callback( cards[ age3Card ] ) ).to.be.true
      expect( player1.hand.length ).to.equal( 5 )
      for( var i = 0; i < player1.hand.length; i++ ) {
         expect( player1.hand[ i ].age ).to.equal( 1 )
      }
   } )
   it( 'Choose not to return', function() {
      returnAThree( game, player1 )
      expect( player1.reaction ).to.not.be.null
      expect( player1.reaction.callback( null ) ).to.be.false
      expect( player1.hand.length ).to.equal( 3 )

   } )
   it( 'Have no threes', function() {
      player1.hand = []
      expect( returnAThree( game, player1 ) ).to.be.false
      expect( player1.reaction ).to.be.null
   } )
} )
describe( 'Writing', function() {
   var dogma
   beforeEach( function() {
      var card = cards[ 'Writing' ]
      dogma = card.dogmas()[ 0 ].execute
      player1.hand = []
   } )
   it( 'Player draws a 2', function() {
      var ret = dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
      expect( player1.hand[ 0 ].age ).to.equal( 2 )
      expect( ret ).to.be.true
   } )
} )
describe( "Calendar", function() {
   var dogma
   beforeEach( function() {
      var card = cards[ "Calendar" ]
      dogma = card.dogmas()[ 0 ].execute
      player1.hand = []
   } )
   it( "More cards in hand than score pile", function() {
      player1.hand.push( game.agePiles[ 0 ].pop() )
      var ret = dogma( game, player1 )
      // Nothing should happen
      expect( player1.hand.length ).to.equal( 1 )
      expect( ret ).to.be.false
   } )
   it( "More cards in score pile than hand", function() {
      player1.scoreCards.push( game.agePiles[ 0 ].pop() )
      var ret = dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 2 )
      expect( player1.hand[ 0 ].age ).to.equal( 3 )
      expect( player1.hand[ 1 ].age ).to.equal( 3 )
      expect( ret ).to.be.true
   } )
} )
describe( "Canal Building", function() {
   var dogma
   beforeEach( function() {
      var card = cards[ "Canal Building" ]
      dogma = card.dogmas()[ 0 ].execute
      player1.hand = []
   } )
   it( "Does exchange", function() {
      var highestAgeInHand = 5
      var highestAgeInScore = 7
      player1.hand.push( game.agePiles[ highestAgeInHand ].pop() )
      player1.hand.push( game.agePiles[ highestAgeInHand ].pop() )
      player1.hand.push( game.agePiles[ 0 ].pop() )
      player1.hand.push( game.agePiles[ 1 ].pop() )
      player1.scoreCards.push( game.agePiles[ 2 ].pop() )
      player1.scoreCards.push( game.agePiles[ highestAgeInScore ].pop() )
      player1.scoreCards.push( game.agePiles[ highestAgeInScore ].pop() )
      player1.scoreCards.push( game.agePiles[ highestAgeInScore ].pop() )
      dogma( game, player1 ) 
      expect( player1.reaction ).to.be.not.null
      expect( player1.reaction.list.length ).to.equal( 2 )
      expect( player1.reaction.callback( true ) ).to.be.true
      expect( player1.hand.length ).to.equal( 5 )
      expect( player1.scoreCards.length ).to.equal( 3 )

   } )
   it( "Nothing in hand or score pile", function() {
      var ret = dogma( game, player1 ) 
      expect( ret ).to.be.false
   } )
   it( "Does not exchange", function() {
      player1.hand.push( game.agePiles[ 0 ].pop() )
      dogma( game, player1 ) 
      expect( player1.reaction ).to.be.not.null
      expect( player1.reaction.list.length ).to.equal( 2 )
      expect( player1.reaction.callback( false ) ).to.be.false
      // Nothing should change
      expect( player1.hand.length ).to.equal( 1 )
      expect( player1.scoreCards ).to.be.empty
   } )
} )
describe( "Currency", function() {
   var dogma
   beforeEach( function() {
      var card = cards[ "Currency" ]
      dogma = card.dogmas()[ 0 ].execute
      player1.hand = []
   } )
   it( "nothing in hand", function() {
      var ret = dogma( game, player1 )
      expect( ret ).to.be.false
   } )
   it( "chooses to return", function() {
      var cardsToReturn = []
      cardsToReturn.push( game.agePiles[ 0 ].pop() )
      cardsToReturn.push( game.agePiles[ 0 ].pop() )
      cardsToReturn.push( game.agePiles[ 3 ].pop() )
      player1.hand = player1.hand.concat( cardsToReturn )
      player1.hand.push( game.agePiles[ 5 ].pop() )
      dogma( game, player1 )
      expect( player1.reaction.list.length ).to.equal( 4 )
      expect( player1.reaction.callback( cardsToReturn ) ).to.be.true
      expect( player1.hand.length ).to.equal( 1 )
      expect( player1.scoreCards.length ).to.equal( 2 )
      expect( player1.scoreCards[ 0 ].age ).to.equal( 2 )
   } )
   it( "Doesn't return anything", function() {
      player1.hand.push( game.agePiles[ 0 ].pop() )
      dogma( game, player1 )
      expect( player1.reaction ).to.be.not.null
      expect( player1.reaction.callback( [] ) ).to.be.false
      expect( player1.scoreCards ).to.be.empty
   } )
} )
describe( "Construction", function() {
   var demand
   var checkEmpire
   beforeEach( function() {
      initGame( [ 
         {
            hand: [],
            board: [ "Construction", "Tools", "Domestication", "Code of Laws" ],
         },
         {
            hand: [ "Mapmaking" ],
            board: [ "Clothing", "Pottery", "City States", "Agriculture" ],
         }
      ] )
      var card = cards[ "Construction" ]
      demand = card.dogmas()[ 0 ].execute
      checkEmpire = card.dogmas()[ 1 ].execute
   } )
   it( "callee has more than 2", function() {
      var mysticism = cards[ "Mysticism" ]
      var writing = cards[ "Writing" ]
      player2.hand.push( mysticism )
      player2.hand.push( writing )
      demand( game, player1, player2 )
      expect( player2.reaction ).to.not.be.null
      expect( player2.reaction.n ).to.equal( 2 )
      player2.reaction.callback( [ mysticism, writing ] )
      expect( player1.hand.length ).to.equal( 2 )
      // Callee draws a 2
      expect( player2.hand.length ).to.equal( 2 )
   } )
   it( "callee has less than 2", function() {
      demand( game, player1, player2 )
      // Callee has no option since less than 2 cards in hand
      expect( player2.reaction ).to.be.null
      expect( player1.hand.length ).to.equal( 1 )
      expect( player2.hand.length ).to.equal( 1 )

   } )
   it( "caller doesn't have 5 top cards", function() {
      checkEmpire( game, player1 )
      expect( player1.achievements.length ).to.equal( 0 )

   } )
   it( "Caller has 5 top cards, noone eles does", function() {
      game.meld( player1, cards[ "Paper" ] )
      console.log( player1 )
      checkEmpire( game, player1 )
      expect( player1.achievements.length ).to.equal( 1 )
   } )
   it( "Caller has 5 top cards, so does someone else", function() {
      game.meld( player1, cards[ "Paper" ] )
      game.meld( player2, cards[ "Gunpowder" ] )
      expect( player1.achievements.length ).to.equal( 0 )
   } )
} )
describe( "Fermenting", function() {
   var dogma
   beforeEach( function() {
      initGame( [
         {
            hand: [],
            board: [ "Clothing" ],
         }
      ] )
      dogma = cards[ "Fermenting" ].dogmas()[ 0 ].execute
   } )
   it( "draws 2 for each leaf, even", function() {
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 1 )
   } )
   it( "draws 2 for each leaf, rounds down", function() {
      game.meld( player1, cards[ "Pottery" ] )
      dogma( game, player1 )
      expect( player1.hand.length ).to.equal( 2 )
   } )
} )

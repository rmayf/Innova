#!/usr/local/bin/node
var engine = require( '../engine' );
var types = require( '../types' );
var cards = require( '../cards' ).Cards;
var expect = require( 'chai' ).expect;

function initGame( players ) {
   for( var i = 0; i < players.length; i++ ) {
      var player = players[ i ]
      player.ptr.actions = 0
      player.ptr.perform = false
      player.ptr.reaction = null
      player.ptr.hand = []
      for( var j = 0; j < player.hand.length; j++ ) {
         var card = player.hand[ j ]
         player.ptr.hand.push( cards[ card ] )
      }
      for( var j = 0; j < player.board.length; j++ ) {
         var card = player.board[ j ]
         game.meld( player.ptr, cards[ card ] )
      }
   }
   game.turn = 1
   players[ 0 ].ptr.actions = 2
   players[ 0 ].ptr.perform = true
}

var game;
var player1;
var player2;
beforeEach( function() {
   game = new engine.Game( 2, 6, function( e ) {
      if( e ) {
         throw e; 
      }
   } ); 
   game.begin( [ 'bob', 'janice' ] );
   player1 = game.players[ 0 ];
   player2 = game.players[ 1 ];
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
      player1.reaction.callback( card.name );
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
      game.reaction( player1.name, age9Card.name);
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
                     ptr: player1,
                     hand: [ "Sailing", "Agriculture", "Archery" ],
                     board: [ "Clothing" ]
                  },
                  {
                     ptr: player2,
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
   //need to store dogmas because of shared state
   var dogmas
   var demand
   var dogma
   beforeEach( function() {
      var oars = cards[ 'Oars' ]
      dogmas = oars.dogmas()
      demand = dogmas[ 0 ].execute
      dogma = dogmas[ 1 ].execute
      player1.hand = []
      player2.hand = []
      game.meld( player1, oars )
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

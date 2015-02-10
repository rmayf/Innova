#!/usr/local/bin/node
var engine = require( '../engine' );
var types = require( '../types' );
var expect = require( 'chai' ).expect;


describe( 'Game Creation', function() {
   describe( 'Constructor', function() {
      it( 'fails when numPlayers > 4', function() {
         expect( function() { new engine.Game( [ 'bob', 'janice', 'frank', 'amy', 'stuart' ], 4 ) } ).to.throw( Error );
      } )
      it( 'fails when numPlayers < 1', function()  {
         expect( function() { new engine.Game( [], 4 ) } ).to.throw( Error );
      } )
      it( 'fails when numAchievemenst < 1', function() {
         expect( function() { new engine.Game( [ 'bob' ], 0 ) } ).to.throw( Error );
      } )
      it( 'fails when numAchievemenst > 14', function() {
         expect( function() { new engine.Game( [ 'bob' ], 15 ) } ).to.throw( Error );
      } )
      it( 'succeed under normal conditions', function() {
         expect( function() { new engine.Game( [ 'bob', 'janice' ], 6 ) } ).to.be.ok;
      } )
   } )
   describe( 'Initial State', function() {
      var players = [ 'bob', 'janice' ];
      var achievements = 6;
      var game;
      var player1;
      var player2;
      beforeEach( function() {
         game = new engine.Game( players, achievements ); 
         player1 = game.players[ 0 ];
         player2 = game.players[ 1 ];
      } )
      it( 'Game State', function() {
         expect( game.players ).to.have.length( players.length );
         expect( game.numAchievements ).to.equal( achievements );
         for( var i = 0; i < game.agePiles.length; i++ ) {
            expect( game.agePiles[ i ] ).to.not.be.empty; 
            expect( game.agePiles[ i ][ 0 ].age ).to.equal( i + 1 );
         }
         for( var i = 1; i < 9; i++ ) {
            expect( game.agePiles[ i ] ).to.have.length( 9 );
         }
         for( var i = 0; i < game.achievements.length; i++ ) {
            expect( game.achievements[ i ].age ).to.equal( i + 1 ); 
         }
         expect( game.achievements ).to.have.length( 9 );
         expect( game.specialAchievements ).to.have.length( 5 );
         expect( game.agePiles[ 0 ] ).to.have.length( 10 );
      } )
      it( 'Player State', function() {
         expect( player1.hand ).to.have.length( 2 );
         for( var i = 0; i < player1.hand.length; i++ ) {
            expect( player1.hand[ i ].age ).to.equal( 1 ); 
         }
         expect( player1.scoreCards ).to.be.empty;
      } ) 
      it( 'Player Ready', function() {
         expect( player1.reaction ).to.exist;
         var firstCard = player1.hand[ 0 ];
         game.reaction( player1.name, firstCard.name );
         expect( player1.reaction ).to.not.exist;
         expect( player1.hand ).to.have.length( 1 );
         expect( player1.board[ firstCard.color ].cards ).to.not.be.empty;
         var secondCard = player2.hand[ 0 ];
         game.reaction( player2.name, secondCard.name );
         expect( player2.board[ secondCard.color ].cards).to.not.be.empty;
         if( firstCard.name.localeCompare( secondCard.name ) > 0) {
            expect( player2.actions ).to.equal( 1 );
            expect( player1.actions ).to.equal( 0 );
         } else {
            expect( player1.actions ).to.equal( 1 );
            expect( player2.actions ).to.equal( 0 );
         }
      } )
   } )
} )

describe( 'Basic Gameplay', function() {
   var game;
   var player1;
   var player2;
   beforeEach( function() {
      game = new engine.Game( [ 'bob', 'janice' ], 6 );
      player1 = game.players[ 0 ];
      player2 = game.players[ 1 ];
   } )
   it( 'Draw Action', function() {
      player1.hand = [];
      var pileNum = game.agePiles[ 0 ].length;
      expect( function() { game.action( player1.name, 'Draw' ) } ).to.throw( Error );
      player1.actions = 1;
      expect( function() { game.action( 'noPlayer', 'Draw' ) } ).to.throw( Error );
      game.action( player1.name, 'Draw' ); 
      expect( player1.hand ).to.have.length( 1 );
      expect( game.agePiles[ 0 ] ).to.have.length( pileNum - 1 );
      expect( player1.actions ).to.equal( 0 );
      game.agePiles[ 0 ] = [];
      var age2 = game.drawCard( 1 );
      expect( age2.age ).to.equal( 2 );
      player1.board[ 0 ].cards.push( game.drawCard( 4 ) );
      player1.actions = 1;
      player1.hand = [];
      game.action( player1.name, 'Draw' );
      expect( player1.hand[ 0 ].age ).to.equal( 4 );
      expect( function() { game.drawCard( 11 ); } ).to.throw( types.VictoryCondition, 'bob, janice' )
      player2.scoreCards.push( {age: 1 } );
      expect( function() { game.drawCard( 11 ); } ).to.throw( types.VictoryCondition, 'janice' )
      player2.scoreCards = [];
   } )
   it( 'Game Flow', function() {
      expect( game.nextPlayer( player1 ) ).to.equal( game.players[ 1 ] );
      expect( game.nextPlayer( game.players[ 1 ] ) ).to.equal( player1 );
      player1.actions = 1;
      game.action( player1.name, 'Draw' );
      expect( game.turn ).to.equal( 1 );
      expect( game.players[ 1 ].actions ).to.equal( 2 );
      game.action( player2.name, 'Draw' );
      game.action( player2.name, 'Draw' );
      expect( game.turn ).to.equal( 2 );
      expect( player1.actions ).to.equal( 2 );
      // Add 4 players
      game.players.push( 'hehe' );
      game.players.push( 'haha' );
      game.turn = 0;
      player1.actions = 1;
      game.action( player1.name, 'Draw' );
      expect( player2.actions ).to.equal( 1 );
   } )
   it( 'Melding', function() {
      player1.actions = 1;
      expect( player1.hand ).to.have.length( 2 );
      var meldCard = player1.hand[ 0 ];
      game.action( player1.name, 'Meld', meldCard.name );
      expect( player1.actions ).to.equal( 0 );
      expect( player1.hand[ 0 ] ).to.not.equal( meldCard );
      expect( player1.hand ).to.have.length( 1 );
      expect( player1.board[ meldCard.color ].cards[ 0 ] ).to.equal( meldCard );
      expect( player1.board[ meldCard.color ].splay ).to.equal( types.None );
      expect( player1.actions ).to.equal( 0 );
   } )
   it( 'Splaying', function() {
      for( var i = 0; i < game.agePiles[ 1 ].length; i++ ) {
         var cur = game.agePiles[ 1 ][ i ];
         if( cur.name === 'Monotheism' || cur.name === 'Philosophy' || cur.name === 'Canal Building' || cur.name === 'Road Building' ) {
            var card = game.agePiles[ 1 ].splice( i, 1 );
            i--;
            player1.hand.push( card[ 0 ] );
         }
      }
      if( player1.hand.length < 6 ) {
         player1.hand.push( game.achievements[ 1 ] );
      }
      player1.actions = 4;
      game.action( player1.name, 'Meld', 'Philosophy' );
      game.action( player1.name, 'Meld', 'Monotheism' );
      expect( player1.board[ types.Purple ].cards[ 0 ].name ).to.equal( 'Monotheism' );
      game.action( player1.name, 'Meld', 'Canal Building' );
      game.action( player1.name, 'Meld', 'Road Building' );
      expect( player1.getSymbolCount() ).to.eql( [ 1, 3, 0, 2, 0, 0, 6 ] );
      player1.board[ types.Purple ].splay = types.Left;
      expect( player1.getSymbolCount() ).to.eql( [ 1, 3, 0, 2, 0, 1, 6 ] );
      player1.board[ types.Purple ].splay = types.Right;
      expect( player1.getSymbolCount() ).to.eql( [ 1, 4, 0, 2, 0, 1, 6 ] );
      player1.board[ types.Purple ].splay = types.Up;
      expect( player1.getSymbolCount() ).to.eql( [ 1, 3, 0, 2, 0, 3, 6 ] );
   } )
   it( 'Achieving', function() {
      player1.actions = 1;
      expect( function() { game.action( player1.name, 'Achieve', 11 ); } ).to.throw( Error, '11' );
      expect( function() { game.action( player1.name, 'Achieve', 1 ); } ).to.throw( types.InvalidMove, 'enough' );
      player1.scoreCards.push( game.agePiles[ 4 ].pop() );
      expect( function() { game.action( player1.name, 'Achieve', 1 ); } ).to.throw( types.InvalidMove, 'top card' );
      player1.meld( player1.hand[ 0 ].name );
      game.action( player1.name, 'Achieve', 1 );
      expect( player1.achievements ).to.have.length( 1 );
      expect( player1.actions ).to.equal( 0 );
      expect( game.achievements[ 0 ] ).to.be.null; 
      player1.actions = 1;
      expect( function() { game.action( player1.name, 'Achieve', 1 ); } ).to.throw( types.InvalidMove, 'already' );
      player1.scoreCards.push( game.agePiles[ 4 ].pop() );
      game.numAchievements = 2;
      var card = game.agePiles[ 1 ].pop();
      player1.hand.push( card );
      player1.meld( card.name );
      expect( function() { game.action( player1.name, 'Achieve', 2 ); } ).to.throw( types.VictoryCondition, player1.name );
   } )
} )

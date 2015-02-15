#!/usr/local/bin/node
var engine = require( '../engine' );
var types = require( '../types' );
var cards = require( '../cards' ).Cards;
var expect = require( 'chai' ).expect;

var game;
var player1;
var player2;
beforeEach( function() {
   game = new engine.Game( [ 'bob', 'janice' ], 6 ); 
   player1 = game.players[ 0 ];
   player2 = game.players[ 1 ];
} )

describe( 'Game', function() {
   describe( 'constructor', function() {
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
      it( 'succeeds under normal conditions', function() {
         expect( function() { new engine.Game( [ 'bob', 'janice' ], 6 ) } ).to.be.ok;
      } )
   } )
   describe( 'initially', function() {
      it( 'has proper state of card piles', function() {
         expect( game.players ).to.have.length( 2 );
         expect( game.numAchievements ).to.equal( 6 );
         for( var i = 0; i < game.agePiles.length; i++ ) {
            expect( game.agePiles[ i ] ).to.not.be.empty; 
            for( var j = 0; j < game.agePiles[ i ].length; j++ ) {
               expect( game.agePiles[ i ][ j ].age ).to.equal( i + 1 );
            }
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
      it( 'has proper state of players', function() {
         expect( player1.hand ).to.have.length( 2 );
         for( var i = 0; i < player1.hand.length; i++ ) {
            expect( player1.hand[ i ].age ).to.equal( 1 ); 
         }
         expect( player1.scoreCards ).to.be.empty;
      } ) 
      it( 'allows players to meld first card', function() {
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
   describe( 'turn order', function() {
      beforeEach( function() {
         player1.reaction = null;
         player2.reaction = null;
      } )
      it( 'selects players in the right order', function() {
         expect( game.nextPlayer( player1 ) ).to.equal( game.players[ 1 ] );
         expect( game.nextPlayer( game.players[ 1 ] ) ).to.equal( player1 );
      } )
      it( 'transitions to next player', function() {
         player1.actions = 1;
         game.action( player1.name, 'Draw' );
         expect( game.turn ).to.equal( 1 );
         expect( game.players[ 1 ].actions ).to.equal( 2 );
      } )
      it( 'keeps track of the game turn', function() {
         player2.actions = 2;
         game.action( player2.name, 'Draw' );
         game.action( player2.name, 'Draw' );
         expect( game.turn ).to.equal( 1 );
         expect( player1.actions ).to.equal( 2 );
      } )
      it( 'works with 4 players', function() {
         game.players.push( 'hehe' );
         game.players.push( 'haha' );
         game.turn = 0;
         player1.actions = 1;
         game.action( player1.name, 'Draw' );
         expect( player2.actions ).to.equal( 1 );
      } )
   } )
} )

describe( 'Player', function() {
   beforeEach( function() {
      player1.reaction = null;
      player2.reaction = null;
   } )
   describe( 'can', function() {
      it( 'tuck', function() {
        player1.hand.push( cards[ 'Calendar' ] );
        player1.meld( 'Calendar' );
        player1.tuck( cards[ 'Mathematics' ] );
        expect( player1.board[ types.Blue ].cards[ 0 ].name ).to.equal( 'Calendar' );
        expect( player1.board[ types.Blue ].cards[ 1 ].name ).to.equal( 'Mathematics' );
        expect( player1.numTucked ).to.equal( 1 );
        player1.tuck( cards[ 'Canal Building' ] );
        expect( player1.board[ types.Yellow ].cards[ 0 ].name ).to.equal( 'Canal Building' );
      } )
      it( 'meld', function() {
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
      it( 'splay', function() {
         for( var i = 0; i < game.agePiles[ 1 ].length; i++ ) {
            var cur = game.agePiles[ 1 ][ i ];
            if( cur.name === 'Monotheism' || cur.name === 'Philosophy' ||
                cur.name === 'Canal Building' || cur.name === 'Road Building' ) {
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
         expect( player1.getSymbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 0, 6 ] );
         player1.board[ types.Purple ].splay = types.Left;
         expect( player1.getSymbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 1, 6 ] );
         player1.board[ types.Purple ].splay = types.Right;
         expect( player1.getSymbolCount() ).to.eql( [ 4, 1, 0, 2, 0, 1, 6 ] );
         player1.board[ types.Purple ].splay = types.Up;
         expect( player1.getSymbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 3, 6 ] );
      } )
      it( 'achieve', function() {
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
      it( 'draw', function() {
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
      describe( 'claim', function() {
         beforeEach( 'put all cards into player1\'s hand', function() {
            for( var i = 0; i < 10; i++ ) {
               var numCards = game.agePiles[ i ].length
               for( var j = 0; j < numCards; j++ ) {
                  player1.hand.push( game.agePiles[ i ].pop() );
               }
            }
            for( var i = 0; i < 9; i++ ) {
               player1.hand.push( game.achievements.pop() );
            }
            player1.hand.push( player2.hand.pop() );
            player1.hand.push( player2.hand.pop() );
         } )
         it( 'Empire', function() {
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.be.empyty;
            player1.meld( 'Agriculture' );
            player1.meld( 'Mysticism' );
            player1.meld( 'Philosophy' );
            player1.meld( 'Translation' );
            player1.meld( 'Explosives' );
            player1.meld( 'Satellites' );
            for( var i = 0; i < player1.board.length; i++ ) {
               player1.board[ i ].splay = types.Up;
            }
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.not.be.empty;
            game.checkSpecial( player1 );
         } )
         it( 'World', function() {
            player1.meld( 'Rocketry' );
            player1.meld( 'Fission' );
            player1.meld( 'Satellites' );
            player1.meld( 'Databases' );
            game.checkSpecial( player1 ); 
            expect( player1.achievements ).to.be.empty;
            player1.board[ types.Green ].splay = types.Up;
            game.checkSpecial( player1 ); 
            expect( player1.achievements ).to.not.be.empty;
         } )
         it( 'Wonder', function() {
            // Yellow
            player1.meld( 'Agriculture' );
            player1.meld( 'Domestication' );
            player1.board[ types.Yellow ].splay = types.Up;

            // Blue
            player1.meld( 'Pottery' );
            player1.meld( 'Tools' );
            player1.board[ types.Blue ].splay = types.Right;

            // Red
            player1.meld( 'Archery' );
            player1.meld( 'Oars' );
            player1.board[ types.Red ].splay = types.Up;
            
            // Purple
            player1.meld( 'Mysticism' );
            player1.meld( 'Code of Laws' );
            player1.board[ types.Purple ].splay = types.Up;

            game.checkSpecial( player1 );
            expect( player1.achievements ).to.be.empty;

            player1.meld( 'Clothing' );
            player1.board[ types.Green ].splay = types.Up;
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.be.empty;

            player1.board[ types.Green].splay = types.Left;
            player1.meld( 'Sailing' );
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.be.empty;

            player1.board[ types.Green ].splay = types.Right;
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.have.length( 1 );
         } )
         it( 'Universe', function() {
            player1.meld( 'Robotics' );
            player1.meld( 'Self Service' );
            player1.meld( 'Software' );
            player1.meld( 'Stem Cells' );
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.be.empty;
            player1.meld( 'The Internet' );
            game.checkSpecial( player1 );
            expect( player1.achievements ).to.have.length( 1 );
         } )
         it( 'victory by Special Achievements', function() {
            game.numAchievements = 1;
            player1.meld( 'Robotics' );
            player1.meld( 'Self Service' );
            player1.meld( 'Software' );
            player1.meld( 'Stem Cells' );
            player1.meld( 'The Internet' );
            expect( function() { game.checkSpecial( player1 ); } ).to.throw( types.VictoryCondition, player1.name );
            expect( player1.achievements ).to.have.length( 1 );
         } )
      } )
   } )
} )
describe( 'Card', function() {
   describe( 'Agriculture', function() {
      var dogma;
      beforeEach( 'player1 melds agriculture', function() {
         for( var i = 0; i < 2; i++ ) {
            game.agePiles[ 0 ].push( player1.hand.pop() );
            game.agePiles[ 0 ].push( player2.hand.pop() );
         }
         for( var i = 0; i < game.agePiles[ 0 ].length; i++ ) {
            if( game.agePiles[ 0 ][ i ].name == 'Agriculture' ) {
               player1.hand = player1.hand.concat( game.agePiles[ 0 ].splice( i, 1 ) );
               break;
            }
         }
         if( player1.hand.length != 1 ) {
            player1.hand.push( game.achievements.shift() );
         }
         player1.meld( 'Agriculture' );
         dogma = player1.board[ types.Yellow ].cards[ 0 ].dogmas()[ 0 ].execute; 
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
         game.reaction( player1.name, card.name );
         expect( player1.scoreCards[ 0 ].age ).to.equal( 4 );
         expect( player1.getScore() ).to.equal( 4 );
         expect( player1.hand ).to.be.empty;
         expect( game.agePiles[ 2 ][ 0 ] ).to.be.eql( card );
      } )
      it( 'allows any card in hand to be selected', function() {
         var age2Card = game.agePiles[ 1 ].pop();
         var age9Card = game.agePiles[ 8 ].pop();
         player1.hand.splice( 0, 0, age2Card, age9Card );
         dogma( game, player1 );
         game.reaction( player1.name, age9Card.name);
         expect( player1.getScore() ).to.equal( 10 );
         dogma( game, player1 );
         game.reaction( player1.name, age2Card.name );
         expect( player1.getScore() ).to.equal( 10 + 3 );
      } )
      it( 'allows player to decline', function() {
         player1.hand.push( game.agePiles[ 0 ].pop() );
         dogma( game, player1 );
         game.reaction( player1.name, null );
         expect( player1.getScore() ).to.equal( 0 );
      } )
   } )
   describe( 'Code of Laws', function() {
      var dogma;
      beforeEach( function() {
         var card = cards[ 'Code of Laws' ];
         dogma = card.dogmas()[ 0 ].execute;
         var calendar = cards[ 'Calendar' ];
         player1.hand.push( calendar );
         player1.meld( calendar.name );
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
} )

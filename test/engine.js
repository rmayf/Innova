#!/usr/local/bin/node
var engine = require( '../engine' );
var types = require( '../types' );
var cards = require( '../cards' ).Cards;
var expect = require( 'chai' ).expect;

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

describe( 'Game', function() {
   describe( 'constructor', function() {
      it( 'fails when numPlayers > 4', function() {
         expect( function() { new engine.Game( 5, 4 ) } ).to.throw( Error );
      } )
      it( 'fails when numPlayers < 1', function()  {
         expect( function() { new engine.Game( 0, 4 ) } ).to.throw( Error );
      } )
      it( 'fails when numachievemenst < 1', function() {
         expect( function() { new engine.Game( 1, 0 ) } ).to.throw( Error );
      } )
      it( 'fails when numachievemenst > 14', function() {
         expect( function() { new engine.Game( 1, 15 ) } ).to.throw( Error );
      } )
      it( 'succeeds under normal conditions', function() {
         expect( function() { new engine.Game( 2, 6 ) } ).to.be.ok;
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
         expect( player2.board[ secondCard.color ].cards ).to.not.be.empty;
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
         game.turn = 1;
         game.action( player1.name, 'draw' );
         expect( game.turn ).to.equal( 2 );
         expect( game.players[ 1 ].actions ).to.equal( 2 );
      } )
      it( 'keeps track of the game turn', function() {
         player2.actions = 2;
         game.action( player2.name, 'draw' );
         game.action( player2.name, 'draw' );
         expect( game.turn ).to.equal( 1 );
         expect( player1.actions ).to.equal( 2 );
      } )
      it( 'works with 4 players', function() {
         game.players.push( 'hehe' );
         game.players.push( 'haha' );
         game.turn = 1;
         player1.actions = 1;
         game.action( player1.name, 'draw' );
         expect( player2.actions ).to.equal( 1 );
      } )
   } )
   describe( 'transfer', function() {
      it( 'between arrays', function() {
         var src = []
         game.transfer( player1, [ 1 ], [ 1, 2, 3 ], player2, src )
         expect( src.length ).to.equal( 1 )
         expect( src[ 0 ] ).to.equal( 1 )
      } )
      it( 'multiple elements', function() {
         var src = []
         var tx = [ 1, 2, 3 ]
         game.transfer( player1, [ 1, 3 ], tx, player2, src )
         expect( src.length ).to.equal( 2 )
         expect( tx.length ).to.equal( 1 )
         expect( tx[ 0 ] ).to.equal( 2 )
      } )
      it( 'to board', function() {
         var ag = cards[ 'Agriculture' ]
         var src = [ ag ]
         game.transfer( player1, src, src, player2, player2.board )
         expect( src.length ).to.equal( 0 )
         expect( player2.board[ ag.color ].cards.length ).to.equal( 1 )
         expect( player2.board[ ag.color ].cards[ 0 ] ).to.equal( ag )
      } )
      it( 'from board', function() {
         var ag = cards[ 'Agriculture' ]
         var res = []
         game.meld( player1, ag )
         game.transfer( player1, [ ag ], player1.board, player2, res )
         expect( player1.board[ ag.color ].cards.length ).to.equal( 0 )
         expect( res.length ).to.equal( 1 )
         expect( res[ 0 ] ).to.equal( ag )
      } )
   } )
   describe( 'exchange', function() {
      it( 'arrays', function() {
         var lsA = [ 1, 2, 3 ]
         var lsB = [ 5, 6, 7 ]
         game.exchange( function( x ) { return x == 2 }, lsA,
                        function( x ) { return x <=6 }, lsB )
         expect( lsA.length ).to.equal( 4 )
         expect( lsB.length ).to.equal( 2 )
      } )
   } )
   describe( 'toJSON', function() {
      it( 'aoeu', function() {
         JSON.parse( game.serialize( 'bob' ) )
         expect( true )
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
        game.meld( player1, cards[ 'Calendar' ] );
        game.tuck( player1, cards[ 'Mathematics' ] );
        expect( player1.board[ types.Blue ].cards[ 0 ].name ).to.equal( 'Calendar' );
        expect( player1.board[ types.Blue ].cards[ 1 ].name ).to.equal( 'Mathematics' );
        expect( player1.numTucked ).to.equal( 1 );
        game.tuck( player1, cards[ 'Canal Building' ] );
        expect( player1.board[ types.Yellow ].cards[ 0 ].name ).to.equal( 'Canal Building' );
      } )
      it( 'meld', function() {
         player1.actions = 1;
         expect( player1.hand ).to.have.length( 2 );
         var meldCard = player1.hand[ 0 ];
         game.action( player1.name, 'meld', meldCard.name );
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
         game.action( player1.name, 'meld', 'Philosophy' );
         game.action( player1.name, 'meld', 'Monotheism' );
         expect( player1.board[ types.Purple ].cards[ 0 ].name ).to.equal( 'Monotheism' );
         game.action( player1.name, 'meld', 'Canal Building' );
         game.action( player1.name, 'meld', 'Road Building' );
         expect( player1.symbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 0, 6 ] );
         player1.board[ types.Purple ].splay = types.Left;
         expect( player1.symbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 1, 6 ] );
         player1.board[ types.Purple ].splay = types.Right;
         expect( player1.symbolCount() ).to.eql( [ 4, 1, 0, 2, 0, 1, 6 ] );
         player1.board[ types.Purple ].splay = types.Up;
         expect( player1.symbolCount() ).to.eql( [ 3, 1, 0, 2, 0, 3, 6 ] );
      } )
      it( 'achieve', function() {
         player1.actions = 1;
         expect( function() { game.action( player1.name, 'achieve', 11 ); } ).to.throw( Error, '11' );
         expect( function() { game.action( player1.name, 'achieve', 1 ); } ).to.throw( types.InvalidMove, 'enough' );
         player1.scoreCards.push( game.agePiles[ 4 ].pop() );
         expect( function() { game.action( player1.name, 'achieve', 1 ); } ).to.throw( types.InvalidMove, 'top card' );
         game.meld( player1, player1.hand[ 0 ] );
         game.action( player1.name, 'achieve', 1 );
         expect( player1.achievements ).to.have.length( 1 );
         expect( player1.actions ).to.equal( 0 );
         expect( game.achievements[ 0 ] ).to.be.null; 
         player1.actions = 1;
         expect( function() { game.action( player1.name, 'achieve', 1 ); } ).to.throw( types.InvalidMove, 'already' );
         player1.scoreCards.push( game.agePiles[ 4 ].pop() );
         game.numAchievements = 2;
         var card = game.agePiles[ 1 ].pop();
         player1.hand.push( card );
         game.meld( player1, card );
         expect( function() { game.action( player1.name, 'achieve', 2 ); } ).to.throw( types.VictoryCondition, player1.name );
      } )
      it( 'draw', function() {
         player1.hand = [];
         var pileNum = game.agePiles[ 0 ].length;
         expect( function() { game.action( player1.name, 'draw' ) } ).to.throw( Error );
         player1.actions = 1;
         expect( function() { game.action( 'noPlayer', 'draw' ) } ).to.throw( Error );
         game.action( player1.name, 'draw' ); 
         expect( player1.hand ).to.have.length( 1 );
         expect( game.agePiles[ 0 ] ).to.have.length( pileNum - 1 );
         expect( player1.actions ).to.equal( 0 );
         game.agePiles[ 0 ] = [];
         var age2 = game.drawReturn( 1 );
         expect( age2.age ).to.equal( 2 );
         player1.board[ 0 ].cards.push( game.drawReturn( 4 ) );
         player1.actions = 1;
         player1.hand = [];
         game.action( player1.name, 'draw' );
         expect( player1.hand[ 0 ].age ).to.equal( 4 );
         expect( function() { game.drawReturn( 11 ); } ).to.throw( types.VictoryCondition, 'bob, janice' )
         player2.scoreCards.push( {age: 1 } );
         expect( function() { game.drawReturn( 11 ); } ).to.throw( types.VictoryCondition, 'janice' )
         player2.scoreCards = [];
      } )
      it( 'dogma', function() {
         player1.reaction = null;
         player2.reaction = null;
         player1.actions = 1;
         game.turn = 1;
         player1.hand = [];
         dom = cards[ 'Domestication' ];
         ag = cards[ 'Agriculture' ];
         player1.hand.push( cards[ 'Archery' ] );
         game.meld( player1, dom );
         game.meld( player1, ag );
         expect( function() { game.action( player1.name, 'dogma', 'Oars' ) } ).to.throw( types.InvalidMove );
         expect( function() { game.action( player1.name, 'dogma', 'Domestication' ) } ).to.throw( types.InvalidMove );
         game.action( player1.name, 'dogma', 'Agriculture' );
         expect( player1.reaction ).to.not.be.null;
         expect( player2.reaction ).to.be.null;
         expect( player1.perform ).to.be.true;
         expect( player1.reaction.n ).to.equal( 1 );
         expect( player1.reaction.list ).to.contain( cards[ 'Archery' ] );
         expect( game.turn ).to.equal( 1 );
         game.reaction( player1.name, null );
         expect( game.turn ).to.equal( 2 );
         expect( player2.actions ).to.equal( 2 );
         expect( player1.reaction ).to.be.null;
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
         describe( 'Monument', function() {
            it( 'by tucking 6', function() {
               var col = cards[ 'Code of Laws' ];
               game.meld( player1, col ); 
               dogma = col.dogmas()[ 0 ].execute;
               for( var i = 0; i < 6; i++ ) {
                  dogma( game, player1 );
                  player1.reaction.callback( player1.reaction.list[ 0 ] );
                  player1.reaction.callback( true );
               }
               expect( player1.achievements[ 0 ].name ).to.equal( 'Monument' );
            } )
            it( 'by scoring 6', function() {
               for( var i = 0; i < player1.hand.length; i++ ) {
                  if( player1.hand[ i ].age == 10 ) {
                     game.agePiles[ 9 ].push( player1.hand.splice( i, 1 ) );
                     i--;
                  }
               }
               game.turn = 1;
               var ag = cards[ 'Agriculture' ];
               game.meld( player1, ag );
               dogma = ag.dogmas()[ 0 ].execute;
               for( var i = 0; i < 6; i++ ) {
                  dogma( game, player1 );
                  player1.reaction.callback( player1.reaction.list[ 0 ] );
               }
               expect( player1.achievements[ 0 ].name ).to.equal( 'Monument' );
            } )
         } )
         it( 'Empire', function() {
            // player1 can play
            expect( player1.achievements ).to.be.empyty;
            game.meld( player1, cards[ 'Agriculture' ] );
            game.meld( player1, cards[ 'Mysticism' ] );
            game.meld( player1, cards[ 'Philosophy' ] );
            game.meld( player1, cards[ 'Translation' ] );
            game.meld( player1, cards[ 'Explosives' ] );
            game.meld( player1, cards[ 'Satellites' ] );
            for( var i = 0; i < 5; i++ ) {
               game.splay( player1, i, types.Up );
            }
            expect( player1.achievements ).to.not.be.empty;
         } )
         it( 'World', function() {
            game.meld( player1, cards[ 'Rocketry' ] );
            game.meld( player1, cards[ 'Fission' ] );
            game.meld( player1, cards[ 'Satellites' ] );
            game.meld( player1, cards[ 'Databases' ] );
            expect( player1.achievements ).to.be.empty;
            game.splay( player1, types.Green, types.Up );
            expect( player1.achievements ).to.not.be.empty;
         } )
         it( 'Wonder', function() {
            // Yellow
            game.meld( player1, cards[ 'Agriculture' ] );
            game.meld( player1, cards[ 'Domestication' ] );
            game.splay( player1, types.Yellow, types.Up );

            // Blue
            game.meld( player1, cards[ 'Pottery' ] );
            game.meld( player1, cards[ 'Tools' ] );
            game.splay( player1, types.Blue, types.Right );

            // Red
            game.meld( player1, cards[ 'Archery' ] );
            game.meld( player1, cards[ 'Oars' ] );
            game.splay( player1, types.Red, types.Up );
            
            // Purple
            game.meld( player1, cards[ 'Mysticism' ] );
            game.meld( player1, cards[ 'Code of Laws' ] );
            game.splay( player1, types.Purple, types.Up );

            expect( player1.achievements ).to.be.empty;

            game.meld( player1, cards[ 'Clothing' ] );
            game.splay( player1, types.Green, types.Up );
            expect( player1.achievements ).to.be.empty;

            game.splay( player1, types.Green, types.Left );
            game.meld( player1, cards[ 'Sailing' ] );
            expect( player1.achievements ).to.be.empty;

            game.splay( player1, types.Green, types.Right );
            expect( player1.achievements ).to.have.length( 1 );
         } )
         it( 'Universe', function() {
            game.meld( player1, cards[ 'Robotics' ] );
            game.meld( player1, cards[ 'Self Service' ] );
            game.meld( player1, cards[ 'Software' ] );
            game.meld( player1, cards[ 'Stem Cells' ] );
            expect( player1.achievements ).to.be.empty;
            game.meld( player1, cards[ 'The Internet' ] );
            expect( player1.achievements ).to.have.length( 1 );
         } )
         it( 'victory by Special achievements', function() {
            game.numAchievements = 1;
            game.meld( player1, cards[ 'Robotics' ] );
            game.meld( player1, cards[ 'Self Service' ] );
            game.meld( player1, cards[ 'Software' ] );
            game.meld( player1, cards[ 'Stem Cells' ] );
            expect( function() { game.meld( player1, cards[ 'The Internet' ] ) } )
                                 .to.throw( types.VictoryCondition, player1.name );
            expect( player1.achievements ).to.have.length( 1 );
         } )
      } )
   } )
} )
describe( 'dogma', function() {
   describe( 'Sharing draw:', function() {
      beforeEach( function() {
         player1.hand.push( cards[ 'Agriculture' ] );
         player2.hand.push( cards[ 'Pottery' ] );
         player1.actions = 2;
         player2.actions = 1;
         player1.reaction = null;
         player2.reaction = null;
         player1.perform = false;
         player2.perform = false;
         game.turn = 1;
         game.action( player2.name, 'meld', 'Pottery' );
         game.action( player1.name, 'meld', 'Agriculture' );
         game.action( player1.name, 'dogma', 'Agriculture' );
      } )
      it( 'other player accepts', function() {
         expect( function() { game.reaction( player1.name, player1.reaction.list[ 0 ] ) } ).to.throw( Error, "turn to perform" );
         game.reaction( player2.name, player2.reaction.list[ 0 ] );
         expect( game.sharingDraw ).to.be.true;

         expect( function() { game.reaction( player2.name, null ) } ).to.throw( Error, "has no reaction" );
         var cardsInHandBefore = player1.hand.length;
         game.reaction( player1.name, player1.reaction.list[ 0 ] );
         expect( cardsInHandBefore ).to.equal( player1.hand.length );
         expect( game.turn ).to.equal( 3 );
         expect( player1.actions ).to.equal( 0 );
         expect( player2.actions ).to.equal( 2 );
         expect( player1.reaction ).to.be.null;
         expect( player2.reaction ).to.be.null;
      } )
      it( 'other player denies', function() {
         game.reaction( player2.name, player2.reaction.list[ player2.reaction.list.length - 1 ] );   
         expect( player2.score() ).to.equal( 0 );
         expect( player2.hand.length ).to.equal( 2 );
         expect( game.sharingDraw ).to.equal.false;
         game.reaction( player1.name, player1.reaction.list[ 0 ] );
         expect( game.sharingDraw ).to.be.false;
         expect( player1.hand.length ).to.equal( 1 );
      } )
   } )
   describe( 'Demand', function() {
      it( 'caller has more symbols', function() {
         var arch = cards[ 'Archery' ]
         game.meld( player1, arch )
         player1.actions = 1
         player1.reaction = null
         player2.reaction = null
         player2.perform = false
         game.action( player1.name, 'dogma', arch.name )
         expect( player2.reaction ).to.not.be.null
         expect( player2.perform ).to.be.true
      } )
      it( 'caller has less symbols', function() {
         var arch = cards[ 'Archery' ]
         game.meld( player1, arch )
         game.meld( player2, cards[ 'Domestication' ] )
         player1.actions = 1
         player1.reaction = null
         player2.reaction = null
         player2.perform = false
         game.action( player1.name, 'dogma', arch.name )
         expect( player2.reaction ).to.be.null
         expect( player2.perform ).to.be.false
         expect( player1.hand.length ).to.equal( 2 )
         expect( game.turn ).to.equal( 1 )
         expect( player2.actions ).to.equal( 2 )
      } )
   } )
} )

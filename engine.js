var types = require( './types' );
var cards = require( './cards' ).Cards;
var Card = require( './cards' ).Card

var Player = function( name ) {
   this.name = name;
   this.scoreCards = [];
   this.hand = [];
   this.board = new Board();
   this.achievements = [];
   this.reaction = null;
   this.perform = false;
   this.actions = 0;
   this.numTucked = 0;
   this.numScored = 0;

   this.removeFromHand = function( card ) {
      if( this.hand === [] ){
         throw new types.InvalidMove( 'Can\'t remove card from empty hand' );
      }
      var index = 0;
      for( ; index < this.hand.length; index++ ) {
         if( this.hand[ index ] === card ) {
            break;
         }
      }
      if( index === this.hand.length ) {
         throw new types.InvalidMove( card.name + ' not in ' + this.name + '\'s hand' ); 
      }
      var ar = this.hand.splice( index, 1 );
      return ar[ 0 ];
   };
   this.highestTopCard = function() {
      var age = 0;
      for( var i = 0; i < 5; i++ ) {
         if( this.board[ i ].cards.length > 0 ) {
            var cur = this.board[ i ].cards[ 0 ].age;
            if( cur > age ) {
               age = cur;
            }
         }
      }
      return age;
   };
   this.symbolCount = function() {
      var splayHelper = function( table, splay, symbols ) {
         if( splay === types.Left ) {
            table[ symbols.botR ]++;
         } else if ( splay === types.Right ) {
            table[ symbols.botL ]++;
            table[ symbols.topL ]++;
         } else if ( splay === types.Up ) {
            table[ symbols.botL ]++;
            table[ symbols.botM ]++;
            table[ symbols.botR ]++;
         }
      };
      var table = [ 0, 0, 0, 0, 0, 0, 0 ];
      for( var i = 0; i < 5; i++ ) {
         if( this.board[ i ].cards.length === 0 ) {
            continue;
         }
         for( symbol in this.board[ i ].cards[ 0 ].symbols ) {
            table[ this.board[ i ].cards[ 0 ].symbols[ symbol ] ]++;
         }
         if( this.board[ i ].splay !== types.None ) {
            for( var j = 1; j < this.board[ i ].cards.length; j++ ) {
               splayHelper( table, this.board[ i ].splay, this.board[ i ].cards[ j ].symbols );    
            } 
         }
      }
      return table;
   };
   this.score = function() {
      var score = 0;
      for( var i = 0; i < this.scoreCards.length; i++ ) {
         score += this.scoreCards[ i ].age; 
      }
      return score;
   };
}

function Stack() {
   this.splay = types.None;
   this.cards = [];
}

function Board() {
   this[ types.Yellow ] =  new Stack(),
   this[ types.Red ] = new Stack(),
   this[ types.Green ] = new Stack(),
   this[ types.Purple ] = new Stack(),
   this[ types.Blue ] = new Stack(),

   this.unshift = function( card ) {
      this[ card.color ].cards.unshift( card )
   }

   // Same functionality as array
   this.indexOf = function( card ) {
      var accum = 0;
      for( var i = 0; i < 5; i++ ) {
         for( var j = 0, len = this[ i ].cards.length; j < len; j++ ) {
            if( this[ i ].cards[ j ] == card ) {
               return accum;
            }
            accum++;
         }
      } 
   },
   this.splice = function( idx, n ) {
      if( n != 1 ) {
         throw new Error( 'splice not properly implemented for Board' );
      }
      var spliced = true;
      for( var i = 0; i < 5; i++ ) {
         if( idx >=  this[ i ].cards.length ) {
            idx -= this[ i ].cards.length;
         } else {
            this[ i ].cards.splice( idx, 1 );
            spliced = false;
            break;
         }
      }
      if( spliced ) {
         throw new Error( 'card not found in board splice' );
      }
   }
}

exports.Game = function( numPlayers, numAchievements, callback ) {
   if( numPlayers < 1 || numPlayers > 4 ) {
      callback( new Error( "Invalid number of players" ) );
      return;
   }
   if( numAchievements < 1 || numAchievements > 14 ) {
      callback( new Error( "Invalid number of achievements" ) );
      return;
   }
   this.players = [];
   this.hand = null
   this.scoreCards = null
   this.board = null
   this.decision = null
   this.numAchievements = numAchievements;
   this.sharingDraw = false;
   this.mainPlayer = null;
   this.dogmas = [];
   this.demandPlayers = [];
   this.sharedPlayers = [];
   this.agePiles = [];
   var age = 0;
   var i = 0;
   var length = 15;
   for( card in cards ) {
      if( i == 0 ) {
         this.agePiles[ age ] = [];
      } 
      this.agePiles[ age ][ i ] = cards[ card ];
      i++;
      if( i == length ) {
         shuffle( this.agePiles[ age ] );
         length = 10;
         i = 0;
         age++;
      } 
   }

   this.achievements = [];
   for( var i = 0; i < 9; i++ ) {
      this.achievements[ i ] = this.agePiles[ i ].pop();
   }

   this.specialAchievements = [];
   this.specialAchievements[ types.Monument ] = { name: 'Monument' };
   this.specialAchievements[ types.Empire ] = { name: 'Empire' };
   this.specialAchievements[ types.World ] = { name: 'World' };
   this.specialAchievements[ types.Wonder ] = { name: 'Wonder' };
   this.specialAchievements[ types.Universe ] = { name: 'Universe' };
   this.turn = 0;
   this.begin = function( playerNames ) {
      for( var i = 0; i < playerNames.length; i++ ) {
         this.players.push( new Player( playerNames[ i ] ) ); 
      }
      for( var i = 0; i < this.players.length; i++ ) {
         this.players[ i ].hand.push( this.agePiles[ 0 ].pop() );
         this.players[ i ].hand.push( this.agePiles[ 0 ].pop() );
      }
      var playerReady = [];
      var numPlayers = this.players.length;
      for( var i = 0; i < this.players.length; i++ ) {
         var player = this.players[ i ];
         var callback = ( function( player ) {
            return ( function( cardName ) {
                        var card = cards[ cardName ];
                        if( card === undefined ) {
                           throw new types.InvalidMove( cardName + ' is not a card' )
                        }
                        player.removeFromHand( card );
                        this.meld( player, card );
                        playerReady.push( { cardName: cardName,
                                              player: player } );
                        return playerReady;
                   } ).bind( this );
         } ).bind( this );
         player.reaction = new types.Reaction( 1, this.players[ i ].hand, callback( this.players[ i ] ) );
         player.perform = true;
      }
   }
   this.drawReturn = function( age ) {
      var attemptAge = age;
      while( attemptAge <= 10 && this.agePiles[ attemptAge - 1 ].length === 0 ) {
         attemptAge++;
      }

      if( attemptAge > 10 ) {
         var highest = { score: 0,
                         numAchievements: 0,
                         players: [] };
         var setHighest = function( player ) {
            highest.score = player.score();
            highest.numAchievements = player.achievements.length;
            highest.players = [ player ];
         }
         setHighest( this.players[ 0 ] );
         for( var i = 1; i < this.players.length; i++ ) {
            var player = this.players[ i ];
            var playerScore = player.score();
            if( playerScore > highest.score ) {
               setHighest( player );
            } else if ( playerScore === highest.score ) {
               if( player.achievements.length > highest.players[ 0 ].achievements.length ) {
                  setHighest( player );
               }  else if( player.achievements.length === highest.players[ 0 ].achievements.length ) {
                  highest.players.push( player );
               }
            }
         }
         throw new types.VictoryCondition( highest.players, 'won from drawing above age 10' );
      }
      return this.agePiles[ attemptAge - 1 ].pop();
   };
   this.draw = function( player, age ) {
      if( !age ) {
         age = player.highestTopCard();
         if( age == 0 ) {
            age = 1; 
         }
      }
      player.hand.push( this.drawReturn( age ) );
   }
   this.nextDogma = function() {
      if( this.dogmas.length == 0 ) {
         if( this.sharingDraw ) {
            this.draw( this.mainPlayer );
         }
         this.mainPlayer.actions--;
      } else {
         var dogma = this.dogmas.shift();
         var game = this;
         if( dogma.demand ) {
            for( var j = 0; j < this.demandPlayers.length; j++ ) {
               //no sharing draw for demand dogmas
               dogma.execute( game, player, this.demandPlayers[ j ] );
            }
         } else {
            for( var j = 0; j < this.sharedPlayers.length; j++ ) {
               var res = dogma.execute( game, this.sharedPlayers[ j ] );
               if( res ) {
                  this.sharingDraw = true;
               }
            }
         }
         var i = 0;
         var player = this.nextPlayer( this.mainPlayer );
         while( player.reaction == null && i < this.players.length ) {
            player = this.nextPlayer( player ); 
            i++;  
         }
         if( i == this.players.length ) {
            this.nextDogma();
         } else {
            player.perform = true;
         }
      }
   };
   this.reaction = function( playerName, entity ) {
      var player = this.lookupPlayer( playerName );
      if( player.reaction == null ) {
         throw new Error( playerName + ' has no reaction' );
      }
      if( player.perform == false ) {
         throw new Error( 'not ' + playerName + '\'s turn to perform' );
      }
      player.perform = false;
      var callback = player.reaction.callback;
      player.reaction = null;
      var shared = callback( entity );
      if( shared === true && this.mainPlayer && playerName !== this.mainPlayer.name ) {
         this.sharingDraw = true;
      }
      var nextPlayer = player;
      var lastReaction = true;
      for( var i = 0; i < this.players.length; i++ ) {
         if( this.players[ i ].reaction != null ) {
            lastReaction = false;
            break;
         }
      }
      if( lastReaction ) {
         if( this.turn == 0 ) {
            var playerReady = shared;
            playerReady.sort( function( a, b ) {
               return a.cardName.localeCompare( b.cardName ); 
            } );
            playerReady[ 0 ].player.actions = 1;
            this.turn++;
         } else {
            this.nextDogma();   
            if( this.mainPlayer.actions == 0 ) {
               this.endTurn( player );
            }
         }
      } else {
         while( nextPlayer.reaction == null ) {
            nextPlayer = this.nextPlayer( nextPlayer );
         }
         nextPlayer.perform = true;
      }
   };
   this.action = function( playerName, action, cardName ) {
      var player = this.lookupPlayer( playerName );
      if( player.actions <= 0 ) {
         throw new Error( player.name + ' has no actions' );
      }
      if( player.reaction != null ) {
         throw new Error( player.name + ' has outstanding reaction' );
      }
      switch( action ) {
         case 'draw':
            this.draw( player );
            player.actions--;
            break;
         case 'meld':
            var card = cards[ cardName ];
            player.removeFromHand( card );
            this.meld( player, card );
            player.actions--;
            break;
         case 'achieve':
            var age = cardName;
            if( age < 1 || age > 10 ) {
               throw new Error( 'can\'t achieve age ' + age + ', doesn\'t exist' );
            }
            if( this.achievements[ age - 1 ] === null ) {
               throw new types.InvalidMove( age + ' has already been achieved' );
            }
            if( player.score() < age * 5 ) {
               throw new types.InvalidMove( player + ' doesn\'t have enough to achieve ' + age );
            }
            if( player.highestTopCard() < age ) {
               throw new types.InvalidMove( player + ' doesn\'t have a top card at least age ' + age );
            }
            player.achievements.push( this.achievements[ age - 1 ] );
            this.achievements[ age - 1 ] = null;
            if( player.achievements.length >= this.numAchievements ) {
               throw new types.VictoryCondition( [ player ], 'reached ' + numAchievements + ' achievements!' );
            }
            player.actions--;
            break;
         case 'dogma':
            var card = cards[ cardName ];
            var cardsColorPile = player.board[ card.color ].cards;
            if( cardsColorPile.length == 0 || cardsColorPile[ 0 ] !== card ) {
               throw new types.InvalidMove( player, cardName + ' is not a top card' ); 
            }
            this.mainPlayer = player;
            this.sharingDraw = false;
            this.demandPlayers = [];
            this.sharedPlayers = [];

            var playerCount = player.symbolCount()[ card.dogmaSymbol ];
            var other = player;
            for( var i = 0; i < this.players.length; i++ ) {
               var other = this.nextPlayer( other );
               var otherCount = 0;
               if( player !== other ) {
                  otherCount = other.symbolCount()[ card.dogmaSymbol ];
               } else {
                  otherCount = playerCount;
               }
               if( playerCount > otherCount ) {
                  this.demandPlayers.push( other );
               } else {
                  this.sharedPlayers.push( other );
               }
            }
            this.dogmas = card.dogmas();
            this.nextDogma();
      } 
      if( player.actions == 0 ) {
         this.endTurn( player );
      }
   }
   this.endTurn = function( player ) {
      for( var i = 0; i < this.players.length; i++ ) {
         this.players[ i ].numTucked = 0;
         this.players[ i ].numScored = 0; 
      }
      var nextPlayer = this.nextPlayer( player );
      if( this.turn === 1 && this.players.length === 4 ) {
         nextPlayer.actions = 1;
      } else {
         nextPlayer.actions = 2;
      }
      this.turn++;
   };
   this.nextPlayer = function( player ) {
      var i = this.players.indexOf( player );
      if( i === -1 ){
         throw new Error( player + ' is not in the game' ); 
      }
      if( i === this.players.length - 1 ) {
         return this.players[ 0 ];
      }
      return this.players[ i + 1 ];
   };
   this.doAchieve = function( player, achievement ) {
      if( this.specialAchievements[ achievement ] != null ) {
         player.achievements.push( this.specialAchievements[ achievement ] );
         this.specialAchievements[ achievement ] = null;
      }
      if( player.achievements.length >= this.numAchievements ) {
         throw new types.VictoryCondition( [ player ], 'Special achievements' );
      }
   };
   this.checkWonder = function( player ) {
      var fiveStacks = true;
      for( var i = 0; i < 5; i++ ) {
         if( player.board[ i ].cards.length < 2 ) { // Need at least two cards in a stack for splay to take effect
            fiveStacks = false;
         }
      }
      if( fiveStacks ) {
         var i = 0;
         for( ; i < 5; i++ ) {
            if( player.board[ i ].splay !== types.Up && player.board[ i ].splay !== types.Right ) {
               break;
            }
         } 
         if( i === 5 ) {
            this.doAchieve( player, types.Wonder );
         }
      } 
   };
   this.checkUniverse = function( player ) {
      var fiveStacks = true;
      for( var i = 0; i < 5; i++ ) {
         if( player.board[ i ].cards.length === 0 ) {
            fiveStacks = false;
         }
      }
      if( fiveStacks ) {
         var i = 0;
         for( ; i < 5; i++ ) {
            if( player.board[ i ].cards[ 0 ].age < 8 ) {
               break;
            }
         } 
         if( i === 5 ) {
            this.doAchieve( player, types.Universe );
         }
      }
   };
   this.checkEmpireAndWorld = function( player ) {
      var symbols = player.symbolCount();
      var all = true;
      // start at i = 1 to skip counting Hex symbols
      for( var i = 1; i < symbols.length; i++ ) {
         if( symbols[ i ] < 3 ) {
            all = false;
            break;
         }
      }
      if( all ) {
         this.doAchieve( player, types.Empire ); 
      }
      if( symbols[ types.Clock ] >= 12 ) {
         this.doAchieve( player, types.World );
      }
   };
   this.lookupPlayer = function( playerName ) {
      var player;
      for( var i = 0; i < this.players.length; i++ ) {
         if( this.players[ i ].name === playerName ) {
            return this.players[ i ];
         }
      }
      throw new Error( playerName + ' not found' );
   }
   this.score = function( player, card ) {
      player.scoreCards.push( card );
      player.numScored++;
      if( player.numScored >= 6 ) {
        this.doAchieve( player, types.Monument ); 
      }
   };
   this.tuck = function( player, card ) {
      player.board[ card.color ].cards.push( card );
      player.numTucked++;
      if( player.numTucked >= 6 ) {
         this.doAchieve( player, types.Monument );
      }
      this.checkUniverse( player );
      this.checkEmpireAndWorld( player );
   };
   this.meld = function( player, card ) {
      player.board[ card.color ].cards.unshift( card );
      this.checkUniverse( player );
      this.checkEmpireAndWorld( player );
   };
   this.splay = function( player, color, direction ) {
      player.board[ color ].splay = direction;
      this.checkEmpireAndWorld( player );
      this.checkWonder( player );
   };
   this.exchange = function( fnA, lsA, fnB, lsB ) {
      var split = function( fn, ls ) {
         // removes elements for which fn( elem ) is true
         // returns list of removed elements
         matches = [];
         for( var i = 0; i < ls.length; i++ ) {
            if( fn( ls[ i ] ) ) {
               matches.concat( ls.splice( i, 1 ) );
               i--;
            }
         }
         return matches;
      }
      matchesA = split( fnA, lsA );
      lsA.concat( split( fnB, lsB ) );
      lsB.concat( matchesA );
   };
   this.transfer = function( txPlayer, txCards, txSrc, rxPlayer, rxSrc ) {
      for( var i = 0; i < txCards.length; i++ ) {
         rxSrc.unshift( txCards[ i ] );
      };
      for( var i = 0, len = txCards.length; i < len; i++ ) {
         idx = txSrc.indexOf( txCards[ i ] );
         txSrc.splice( idx, 1 );
      }
      
      this.checkEmpireAndWorld( rxPlayer );
      this.checkEmpireAndWorld( txPlayer );
      this.checkUniverse( rxPlayer );
      this.checkUniverse( txPlayer );
   };
   this.return = function( player, card ) {
      player.removeFromHand( card )
      this.agePiles[ card.age - 1 ].unshift( card )
   }
   this.serialize = function( playerName ) {
      var player
      for( var i = 0; i < this.players.length; i++ ) {
         if( this.players[ i ].name === playerName ) {
            player = this.players[ i ]
            break
         }
      }
      return JSON.stringify( this, function( k, v ) {
         if( typeof v === 'function' ) {
            return undefined
         }
         if( v instanceof Card ) {
            return v.name
         }
         if( this instanceof exports.Game ) {
            if( k === 'dogmas' || k === 'demandPlayers' || k === 'sharedPlayers'
                || k === 'mainPlayer' || k === 'sharingDraw' ) {
               return undefined 
            }
            if( k === 'agePiles' ) {
               var safeAgePiles = []
               for( var i = 0; i < 10; i++ ) {
                  safeAgePiles[ i ] = v[ i ].length
               }
               return safeAgePiles
            }
            if( k === 'achievements' ) {
               var safeAchievements = []
               for( var i = 0; i < 9; i++ ) {
                  safeAchievements[ i ] = true
                  if( v[ i ] === null ) {
                     safeAchievements[ i ] = false
                  }
               }
               return safeAchievements
            }
            if( k === 'hand' ) {
               return player.hand
            }
            if( k === 'scoreCards' ) {
               return player.scoreCards
            }
            if( k === 'board' ) {
               return player.board
            }
            if( k === 'decision' ) {
               return player.reaction
            }
         }
         if( this instanceof Player ) {
            if( this.name !== playerName ) {
               if( k === 'hand' || k === 'scoreCards' ) {
                  var privateHand = []
                  for( var i = 0; i < v.length; i++ ) {
                     privateHand.push( v[ i ].age )
                  }
                  return privateHand
               }
               if( k === 'reaction' ) {
                  return undefined
               }
            }
         }
         return v
      } )
   }
   callback( null, this );
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

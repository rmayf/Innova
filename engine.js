var types = require( './types' );
var cards = require( './card' );
var http = require( 'http' );

exports.Player = function( name ) {
   this.name = name;
   this.scoreCards = [];
   this.hand = [];
   this.board = [ new Stack(), new Stack(), new Stack(), new Stack(), new Stack() ];
   this.achievements = [];
   this.reaction = null;
   this.actions = 0;
   this.numTucked = 0;
   this.numScored = 0;

   this.removeCard = function( cardName ) {
      if( this.hand === [] ){
         throw new types.InvalidMove( 'Can\'t remove card from empty hand' );
      }
      var index = 0;
      for( ; index < this.hand.length; index++ ) {
         if( this.hand[ index ].name === cardName ) {
            break;
         }
      }
      if( index === this.hand.length ) {
         throw new types.InvalidMove( cardName + ' not in ' + this.name + '\'s hand' ); 
      }
      var ar = this.hand.splice( index, 1 );
      return ar[ 0 ];
   };
   this.meld = function( cardName ) {
      var card = this.removeCard( cardName );
      this.board[ card.color ].cards.splice( 0, 0, card );
   };
   this.highestTopCard = function() {
      var age = 0;
      for( var i = 0; i < this.board.length; i++ ) {
         if( this.board[ i ].cards.length > 0 ) {
            var cur = this.board[ i ].cards[ 0 ].age;
            if( cur > age ) {
               age = cur;
            }
         }
      }
      return age;
   };
   this.getCardFromBoard = function( cardName ) {
      for( var i = 0; i < this.board.length; i++ ) {
         if( this.board[ i ][ 0 ].name === cardName ) {
            return this.board[ i ][ 0 ];
         }
      }
      return null;
   };
   this.getSymbolCount = function() {
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
      for( var i = 0; i < this.board.length; i++ ) {
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
   this.getScore = function() {
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

exports.Game = function( playerNames, numAchievements ) {
   if( playerNames.length < 1 || playerNames.length > 4 ) {
      throw new Error( "Invalid number of players" );
   }
   if( numAchievements < 1 || numAchievements > 14 ) {
      throw new Error( "Invalid number of achievements" );
   }
   this.players = [];
   for( var i = 0; i < playerNames.length; i++ ) {
      this.players.push( new exports.Player( playerNames[ i ] ) ); 
   }
   this.numAchievements = numAchievements;
   this.agePiles = [];
   for( var i = 0; i < 10; i++ ) {
      this.agePiles[ i ] = [];
      for( var j = 0; j < cards.agePiles[ i ].length; j++ ) {
         this.agePiles[ i ][ j ] = cards.agePiles[ i ][ j ];
      }
      shuffle( this.agePiles[ i ] );
   }

   this.achievements = [];
   for( var i = 0; i < 9; i++ ) {
      this.achievements[ i ] = this.agePiles[ i ].pop();
   }

   this.specialAchievements = [];
   this.specialAchievements[ types.Monument ] = { name: 'Monument' };
   this.specialAchievements[ types.Empire ] = { name: 'Emipre' };
   this.specialAchievements[ types.World ] = { name: 'World' };
   this.specialAchievements[ types.Wonder ] = { name: 'Wonder' };
   this.specialAchievements[ types.Universe ] = { name: 'Universe' };
   this.turn = 0;
   this.drawCard = function( age ) {
      var attemptAge = age;
      while( attemptAge <= 10 && this.agePiles[ attemptAge - 1 ].length === 0 ) {
         attemptAge++;
      }

      if( attemptAge > 10 ) {
         var highest = { score: 0,
                         numAchievements: 0,
                         players: [] };
         var setHighest = function( player ) {
            highest.score = player.getScore();
            highest.numAchievements = player.achievements.length;
            highest.players = [ player ];
         }
         setHighest( this.players[ 0 ] );
         for( var i = 1; i < this.players.length; i++ ) {
            var player = this.players[ i ];
            var playerScore = player.getScore();
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
         throw new types.VictoryCondition( highest.players );
      }

      return this.agePiles[ attemptAge - 1 ].pop();
   }
   for( var i = 0; i < this.players.length; i++ ) {
      this.players[ i ].hand.push( this.agePiles[ 0 ].pop() );
   }
   var playerReady = [];
   var numPlayers = this.players.length;
   for( var i = 0; i < this.players.length; i++ ) {
      var player = this.players[ i ];
      var callback = function( player ) {
         return function( cardName ) {
                     player.meld( cardName );
                     playerReady.push( { cardName: cardName,
                                           player: player } );
                     if( playerReady.length === numPlayers ) {
                        playerReady.sort( function( a, b ) {
                           return a.cardName.localeCompare( b.cardName ); 
                        } );
                        playerReady[ 0 ].player.actions = 1;
                     }
                };
      };
      player.hand.push( this.agePiles[ 0 ].pop() );   
      player.reaction = new types.Reaction( 1, this.players[ i ].hand, callback( this.players[ i ] ) );
   }
   this.reaction = function( playerName, entity ) {
      var player = this.lookupPlayer( playerName );
      var callback = player.reaction.callback;
      player.reaction = null;
      callback( entity );
   };
   this.action = function( playerName, action, cardName ) {
      var player = this.lookupPlayer( playerName );
      if( player.actions <= 0 ) {
         throw new Error( player.name + ' has no actions' );
      }
      switch( action ) {
         case 'Draw':
            var age = player.highestTopCard();
            if( age == 0 ) {
               age = 1; 
            }
            player.hand.push( this.drawCard( age ) );
            break;
         case 'Meld':
            player.meld( cardName );
            this.checkSpecial( player );
            break;
         case 'Achieve':
            var age = cardName;
            if( this.achievements[ age ] === null ) {
               throw new types.InvalidMove( age + ' has already been achieved' );
            }
            if( player.getScore() < age * 5 ) {
               throw new types.InvalidMove( player + ' doesn\'t have enough to achieve ' + age );
            }
            if( player.highestTopCard() < age ) {
               throw new types.InvalidMove( player + ' doesn\'t have a top card at least age ' + age );
            }
            player.achievements.push( this.achievements[ age ] );
            this.achievements[ age ] = null;
            if( player.achievements.length >= this.numAchievements ) {
               throw new types.VictorCondition( player, 'reached ' + numAchievements + ' achievements!' );
            }
            break;
         case 'Dogma':
            var card = player.getCardFromBoard( cardName );
            if( card === null ) {
               throw new InvalidMove( player, cardName + ' is not a top card' ); 
            }
            var playerCount = player.getSymbolCount()[ card.dogmaSymbol ];
            var demandPlayers = [];
            var sharedPlayers = [];
            var other = player;
            for( var i = 0; i < this.players.length; i++ ) {
               var other = this.nextPlayer( other );
               var otherCount = 0;
               if( player !== other ) {
                  otherCount = other.getSymbolCount()[ card.dogmaSymbol ];
               } else {
                  otherCount = playerCount;
               }
               if( playerCount > otherCount ) {
                  demandPlayers.push( other );
               } else {
                  sharedPlayers.push( other );
               }
            }
            var game = this;
            for( var i = 0; i < card.dogmas.length; i++ ) {
               var dogma = card.dogmas[ i ];
               if( dogma.demand ) {
                  for( var j = 0; j < demandPlayers; j++ ) {
                     dogma( game, player, demandPlayers[ j ] );
                     this.checkSpecialAll(); 
                  }
               } else {
                  for( var j = 0; j < sharedPlayers.length; j++ ) {
                     dogma( game, sharedPlayers[ j ] );
                     this.checkSpecialAll();
                  }
               }
            }
      } 
      player.actions--;
      if( player.actions === 0 ) {
         for( var i = 0; i < this.players.length; i++ ) {
            this.players[ i ].numTucked = 0;
            this.players[ i ].numScored = 0; 
         }
         var nextPlayer = this.nextPlayer( player );
         if( this.turn === 0 && this.players.length === 4 ) {
            nextPlayer.actions = 1;
         } else {
            nextPlayer.actions = 2;
         }
         this.turn++;
      }
   }
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
   this.checkSpecial = function( player ) {
      var doAchieve = function( achievement ) {
         player.achievements.push( this.specialAchievements[ achievement ] );
         this.specialAchievements[ achievement ] = null;
      };
      if( this.specialAchievements[ types.Monument ] !== null ) {
         if( player.numTucked >= 6 || player.numScored >= 6 ) {
            doAchieve( types.Monument );
         }
      }
      var symbolCount = player.getSymbolCount();
      if( this.specialAchievements[ types.Empire ] !== null ) {
         var all = true;
         for( var i = 0; i < symbolCount.length; i++ ) {
            if( symbolCount[ i ] < 3 ) {
               all = false;
               break;
            }
         }
         if( all ) {
            doAchieve( types.Empire ); 
         }
      }
      if( this.specialAchievements[ types.World ] !== null ) {
         if( symbolCount[ types.Clock ] >= 12 ) {
            doAchieve( types.World );
         }
      }
      if( this.specialAchievements[ types.Wonder ] !== null ) {
         var fiveStacks = true;
         for( var i = 0; i < player.board.length; i++ ) {
            if( player.board[ i ].cards.length === 0 ) {
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
               doAchieve( types.Wonder );
            }
         } 
      }
      if( this.specialAchievements[ types.Universe ] !== null ) {
         var fiveStacks = true;
         for( var i = 0; i < player.board.length; i++ ) {
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
               doAchieve( types.Universe );
            }
         }
      }
      if( player.achievements.length > this.numAchievements ) {
         throw new VictoryCondition( player, 'Special achievements' );
      }
   };
   this.checkSpecialAll = function() {
      for( var i = 0; i < this.players.length; i++ ) {
         this.checkSpecial( this.players[ i ] );
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

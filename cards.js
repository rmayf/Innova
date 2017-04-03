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
   this.contains = function( symbol ) {
      if( this.symbols.topL == symbol ) {
         return true;
      } else if( this.symbols.botL == symbol ) {
         return true;
      } else if( this.symbols.botM == symbol ) {
         return true;
      } else if( this.symbols.botR == symbol ) {
         return true;
      } else {
         return false;
      }
   }
}

exports.Card = Card

var translateCard = function( cardName ) {
   if( cardName == null ) {
      return null
   }
   // TODO
   // Add more error checking, what if cardName is not a card?
   // what if a list is passed in?
   // cardName must be a string
   // cardName must exist in cards object
   return cards[ cardName ]
}

exports.translateCard = translateCard

var translateCardList = function( cardList ) {
   // TODO card list must be a list of strings that are valid cards
   if( cardList == null ) {
      return null
   }
   var cards = []
   for( var i = 0; i < cardList.length; i++ ) {
      cards.push( translateCard( cardList[ i ] ) )
   }
   return cards
}

var translateBoolean = function( entity ) {
   // TODO
   // make sure it is a boolean
   return entity
}

var AgricultureDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.hand.length == 0 ) {
               return false;
            }
            player.reaction = new types.Reaction( 1, player.hand.concat( [ null ] ), translateCard,
                                                  function( card ) {
               if( card != null ) {
                  game.return( player, card )
                  game.score( player,
                              game.drawReturn( card.age + 1 ) );
                  return true;
               }
               return false
            } )
         }
      }
   ]
}
var ArcheryDogmas = function() {
   return [ { demand: true,
              execute: function( game, caller, callee ) {
                 game.draw( callee, 1 )
                 var highestCards = [ callee.hand[ 0 ] ]
                 var highestAge = callee.hand[ 0 ].age
                 for( var i = 1; i < callee.hand.length; i++ ) {
                    if( callee.hand[ i ].age > highestAge ) {
                       highestCards = [ callee.hand[ i ] ]
                       highestAge = callee.hand[ i ].age
                    } else if ( callee.hand[ i ].age == highestAge ) {
                       highestCards.push( callee.hand[ i ].name )
                    }
                 }
                 var _transfer = function( card ) {
                    game.transfer( callee, [ cards[ card ] ], callee.hand,
                                   caller, caller.hand )
                 }
                 if( highestCards.length == 1 ) {
                    _transfer( highestCards[ 0 ] )
                 } else {
                    callee.reaction = new types.Reaction( 1, highestCards, translateCard,
                                                          function( card ) {
                       _transfer( card )
                    } )
                 }
              } } ] }
var CityStatesDogmas = function() {
   return [
      {
         demand: true,
         execute: function( game, caller, callee ) {
            if( callee.symbolCount()[ types.Castle ] >= 4 ) {
               var castleTopCards = []
               for( var i = 0; i < 5; i++ ) {
                  if( callee.board[ i ].cards.length > 0 ) {
                     if( callee.board[ i ].cards[ 0 ].contains( types.Castle ) ) {
                        castleTopCards.push( callee.board[ i ].cards[ 0 ].name )
                     }
                  }
               }
               callee.reaction = new types.Reaction( 1, castleTopCards, translateCard,
                                                     function( topCard ) {
                  game.transfer( callee, [ cards[ topCard ] ], callee.board,
                                 caller, caller.board )
                  game.draw( callee, 1 )
               } )
            }
         }
      }
   ]
}
var ClothingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            var colorOnBoard = [];
            for( var i = 0; i < 5; i++ ) {
               colorOnBoard[ i ] = ( player.board[ i ].cards.length != 0 );
            }
            var cardFromHandOfDifferentColor = [];
            for( var i = 0; i < player.hand.length; i++ ) {
               if( !colorOnBoard[ player.hand[ i ].color ] ) {
                  cardFromHandOfDifferentColor.push( player.hand[ i ] );   
               }
            }
            if( cardFromHandOfDifferentColor.length == 0 ) {
               return false;
            }
            player.reaction = new types.Reaction( 1, cardFromHandOfDifferentColor, translateCard,
               function( card ) {
                  player.removeFromHand( card );
                  game.meld( player, card );
               } )
            return true;
         }
      },
      {
         demand: false,
         execute: function( game, player ) {
            var changedState = false;
            for( var i = 0; i < 5; i++ ) {
               if( player.board[ i ].cards.length != 0 ) {
                  var j = 0
                  for( ; j < game.players.length; j++ ) {
                     var other = game.players[ j ]
                     if( other != player ) {
                        if( other.board[ i ].cards.length != 0 ) {
                           break
                        }
                     }
                  }
                  if( j == game.players.length ) {
                     changedState = true
                     game.score( player, game.drawReturn( 1 ) )
                  }
               }
            }
            return changedState
         }
      }
   ]
}
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
                                                                translateCard, function( card ) {
                                  if( card == null ) {
                                     return false;
                                  }
                                  player.removeFromHand( card );
                                  game.tuck( player, card );
                                  player.reaction = new types.Reaction( 1, [ true, false ],
                                                                        translateBoolean, function( ans ) {
                                       if( ans ) {
                                          player.board[ card.color ].splay = types.Left;
                                       }
                                    } ); 
                               } );
                          return true; } } ] };
var domesticationDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            var lowestCards = []
            var lowestAge = 11
            for( var i = 0; i < player.hand.length; i++ ) {
               var card = player.hand[ i ]
               if( card.age < lowestAge ) {
                  lowestAge = card.age
                  lowestCards = [ card ]
               } else if( card.age == lowestAge ) {
                  lowestCards.push( card )
               }
            }
            if( lowestCards.length > 0 ) {
               player.reaction = new types.Reaction( 1, lowestCards, translateCard, function( card ) {
                  player.removeFromHand( card )
                  game.meld( player, card )
                  game.draw( player, 1 )
                  return true
               } )
            } else {
               game.draw( player, 1 )
               return true
            }
         }
      }
   ]
}
var masonryDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            //get list of all cards with castle
            var castleCards = player.hand.filter( function( card ) {
               return card.contains( types.Castle )      
            } )
            //if list is not empty, create reaction
            if( castleCards.length > 0 ) {
               //meld each card in provided list in order
               player.reaction = new types.Reaction( '<=' + castleCards.length, castleCards,translateCardList,
                                                     function( cardsToMeld ) {
                  if( cardsToMeld != null && cardsToMeld.length > 0 ) {
                     for( var i = 0; i < cardsToMeld.length; i++ ) {
                        var card = cards[ cardsToMeld[ i ] ]
                        player.removeFromHand( card )
                        game.meld( player, card )
                     }
                     // if melded 4 or more, gain monument
                     if( cardsToMeld.length >= 4 ) {
                        game.doAchieve( player, types.Monument )  
                     }
                     return true
                  } else {
                     return false
                  }
               } )
            } else {
               //else return false
               return false
            }
         }
      }
   ]
}
var metalworkingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            var draw_ = function() {
               var card = game.drawReturn( 1 )
               //reveal?
               if( card.contains( types.Castle ) ) {
                  game.score( player, card )
                  draw_()
               } else {
                  player.hand.push( card )
               }
            }
            draw_()
            return true
         } 
      }
   ]
} 
var mysticismDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            var card = game.drawReturn( 1 )
            //reveal
            if( player.board[ card.color ].cards.length > 0 ) {
               game.meld( player, card )
               game.draw( player, 1 )
            } else {
               player.hand.push( card )
            }
            return true
         }
      }
   ]
} 
var oarsDogmas = function() {
   var cardTransferred = false
   return [
      {
         demand: true,
         execute: function( game, caller, callee ) {
            //gather list of crown cards from callee
            var crownCards = callee.hand.filter( function( card ) {
               return card.contains( types.Crown )
            } )
            if( crownCards.length > 0 ) {
               //create reaction for callee to select which one to xfr
               callee.reaction = new types.Reaction( 1, crownCards, translateCard, function( card ) {
                  //xfr card from callee hand into caller scorepile
                  caller.scoreCards.push( callee.removeFromHand( card ) )
                  //callee draws a one
                  game.draw( callee, 1 )
                  cardTransferred = true
               } )
            }
         }
      },
      {
         demand: false,
         execute: function( game, player ) {
            if( !cardTransferred ) {
               game.draw( player, 1 ) 
               return true
            }
            return false
         }
      }
   ]
}
var potteryDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            var max = 3
            if( player.hand.length < max ) {
               max = player.hand.length
            }
            player.reaction = new types.Reaction( "<=" + max, player.hand, translateCardList, function( cards ) {
               if( cards != null && cards.length > 0 ) {
                  var i
                  for( i = 0; i < cards.length; i++ ) {
                     game.return( player, cards[ i ] )
                  }
                  game.score( player, game.drawReturn( i ) )
                  return true
               }
               return false
            } )
         }
      },
      {
         demand: false,
         execute: function( game, player ) {
            game.draw( player, 1 )
            return true
         }
      }
   ]
}
var sailingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            game.meld( player, game.drawReturn( 1 ) )
            return true
         }
      }
   ]
}
var theWheelDogmas = function() {
   return [
      { 
         demand: false,
         execute: function( game, player ) {
            game.draw( player, 1 )
            game.draw( player, 1 )
            return true
         }
      }
   ]
}
var toolsDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.hand.length > 0 ) {
               player.reaction = new types.Reaction( '<=3', player.hand, translateCardList,
                                                     function( cards ) {
                  if( cards != null && cards.length > 0 ) {
                     var len = cards.length
                     for( var i = 0; i < len; i++ ) {
                        game.return( player, cards[ i ] )
                     }
                     if( cards.length == 3 ) {
                        game.meld( player, game.drawReturn( 3 ) )
                     }
                     return true
                  }
                  return false
               } )
            }
            return false
         }
      },
      {
         demand: false,
         execute: function( game, player ) {
            var threesInHand = player.hand.filter( function( card ) {
               return card.age == 3
            } )
            if( threesInHand.length > 0 ) {
               player.reaction = new types.Reaction( 1,
                                                     threesInHand.concat( [ null ] ),
                                                     translateCard,
                                                     function( card ) {
                  if( card != null ) {
                     game.return( player, card )
                     for( var i = 0; i < 3; i++ ) {
                        game.draw( player, 1 )
                     }
                     return true
                  }
                  return false
               } )
            }
            return false
         }
      }
   ]
}
var writingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            game.draw( player, 2 )
            return true
         }
      }
   ]
}

var calendarDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.scoreCards.length > player.hand.length ) {
               game.draw( player, 3 )
               game.draw( player, 3 )
               return true
            }
            return false
         }
      }
   ]
}
var canalBuildingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.hand.length == 0 && player.scoreCards.length == 0 ) {
               // Don't offer a choice because it doesn't matter
               // because nothing will change
               return false
            }
            // Offer a choice
            player.reaction = new types.Reaction( 1, [ true, false ], translateBoolean, function( ans ) {
               var _highestAgeFilter = function( ls ) {
                  var highestAge = 1
                  for( var i = 0; i < ls.length; i++ ) {
                     if( ls[ i ].age > highestAge ) {
                        highestAge = ls[ i ].age
                     }
                  }
                  return function( card ) {
                     return card.age == highestAge
                  }
               }
               if( ans ) {
                  game.exchange( _highestAgeFilter( player.hand ), player.hand, _highestAgeFilter( player.scoreCards ), player.scoreCards )
                  return true
               }
               return false
            } )
         }
      }
   ]
}
var currencyDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.hand.length == 0 ) {
               return false
            }
            player.reaction = new types.Reaction( "<=" + player.hand.length, player.hand,
                                                  translateCardList, function( cardsToReturn ) {
               if( cardsToReturn.length == 0 ) {
                  return false
               }
               var uniqueAges = []
               for( var i = 0; i < cardsToReturn.length; i++ ) {
                  var card = cardsToReturn[ i ]
                  var j
                  for( j = 0; j < uniqueAges.length; j++ ) {
                     if( uniqueAges[ j ] == card.age ) {
                        break
                     }
                  }
                  if( j == uniqueAges.length ) {
                     uniqueAges.push( card.age )
                  }
                  game.return( player, card )
               }
               for( var i = 0; i < uniqueAges.length; i++ ) {
                  game.score( player, game.drawReturn( 2 ) )
               }
               return true
            } )
         }
      }
   ]
}
var constructionDogmas = function() {
   return [
      {
         demand: true,
         execute: function( game, caller, callee ) {
            if( callee.hand.length > 2 ) {
               // Callee selects 2 cards from hand to xfer
               callee.reaction = new types.Reaction( 2, callee.hand, translateCardList,
                                                     function( cardList ) {
                  // Xfer 2 cards from calle hand to caller hand
                  game.transfer( callee, cardList, callee.hand, caller, caller.hand )
                  game.draw( callee, 2 )
               } )
            } else {
               game.transfer( callee, callee.hand, callee.hand, caller, caller.hand )
               game.draw( callee, 2 )
            }
         }
      },
      {
         demand: false,
         execute: function( game, player ) {
            var allTopCards = function( board ) {
               var i
               for( i = 0; i < 5; i++ ) {
                  if( board[ i ].cards.length == 0 ) {
                     break
                  }
               }
               return i == 5
            }
            if( allTopCards( player.board ) ) {
               var i
               for( i = 0; i < game.players.length; i++ ) {
                  if( game.players[ i ] != player ) {
                     if( allTopCards( game.players[ i ].board ) ) {
                        break
                     }
                  }
               }
               if( i == game.players.length ) {
                  game.doAchieve( player, types.Empire )
                  return true
               }
            }
            return false
         }
      }
   ]
}
var fermentingDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            for( var leafs = player.symbolCount()[ types.Leaf ] / 2; leafs >= 1; leafs-- ) {
               game.draw( player, 2 ) 
            }
            return player.symbolCount()[ types.Leaf ] >= 2
         }
      }
   ]
}
var mathematicsDogmas = function() {
   return [
      {
         demand: false,
         execute: function( game, player ) {
            if( player.hand.length != 0 ) {
               player.reaction = new types.Reaction( "<=1", player.hand, translateCard,
                                                     function( card ) {
                  if( card != null ) {
                     game.return( player, card )
                     game.meld( player, game.drawReturn( card.age + 1 ) )
                     return true
                  }
                  return false
               } )
            }
            return false
         } 
      }
   ]
}
var mapmakingDogmas = function() {
   return [
   ]
}
var monotheismDogmas = function() {
   return [
   ]
}
var philosophyDogmas = function() {
   return [
   ]
}
var roadBulidingDogmas = function() {
   return [
   ]
}
var alchemyDogmas = function() {
   return [
   ]
}
var compassDogmas = function() {
   return [
   ]
}
var educationDogmas = function() {
   return [
   ]
}
var engineeringDogmas = function() {
   return [
   ]
}
var feudalismDogmas = function() {
   return [
   ]
}
var machineryDogmas = function() {
   return [
   ]
}
var medicineDogmas = function() {
   return [
   ]
}
var opticsDogmas = function() {
   return [
   ]
}
var paperDogmas = function() {
   return [
   ]
}
var translationDogmas = function() {
   return [
   ]
}
var anatomyDogmas = function() {
   return [
   ]
}
var colonialismDogmas = function() {
   return [
   ]
}
var enterpriseDogmas = function() {
   return [
   ]
}
var experimentationDogmas = function() {
   return [
   ]
}
var gunpowderDogmas = function() {
   return [
   ]
}
var inventionDogmas = function() {
   return [
   ]
}
var navigationDogmas = function() {
   return [
   ]
}
var perspectiveDogmas = function() {
   return [
   ]
}
var printingPressDogmas = function() {
   return [
   ]
}
var reformationDogmas = function() {
   return [
   ]
}
var astronomyDogmas = function() {
   return [
   ]
}
var bankingDogmas = function() {
   return [
   ]
}
var chemistryDogmas = function() {
   return [
   ]
}
var coalDogmas = function() {
   return [
   ]
}
var measurementDogmas = function() {
   return [
   ]
}
var physicsDogmas = function() {
   return [
   ]
}
var societiesDogmas = function() {
   return [
   ]
}
var statisticsDogmas = function() {
   return [
   ]
}
var steamEngineDogmas = function() {
   return [
   ]
}
var thePirateCodeDogmas = function() {
   return [
   ]
}
var atomicTheoryDogmas = function() {
   return [
   ]
}
var canningDogmas = function() {
   return [
   ]
}
var classificationDogmas = function() {
   return [
   ]
}
var democracyDogmas = function() {
   return [
   ]
}
var emancipationDogmas = function() {
   return [
   ]
}
var encyclopediaDogmas = function() {
   return [
   ]
}
var industrializationDogmas = function() {
   return [
   ]
}
var machineToolsDogmas = function() {
   return [
   ]
}
var metricSystemDogmas = function() {
   return [
   ]
}
var vaccinationDogmas = function() {
   return [
   ]
}
var bicycleDogmas = function() {
   return [
   ]
}
var combustionDogmas = function() {
   return [
   ]
}
var electricityDogmas = function() {
   return [
   ]
}
var evolutionDogmas = function() {
   return [
   ]
}
var explosivesDogmas = function() {
   return [
   ]
}
var lightingDogmas = function() {
   return [
   ]
}
var publicationsDogmas = function() {
   return [
   ]
}
var railroadDogmas = function() {
   return [
   ]
}
var refrigerationDogmas = function() {
   return [
   ]
}
var sanitationDogmas = function() {
   return [
   ]
}
var antibioticsDogmas = function() {
   return [
   ]
}
var corporationsDogmas = function() {
   return [
   ]
}
var empiricismDogmas = function() {
   return [
   ]
}
var flightDogmas = function() {
   return [
   ]
}
var massMediaDogmas = function() {
   return [
   ]
}
var mobilityDogmas = function() {
   return [
   ]
}
var quantumTheoryDogmas = function() {
   return [
   ]
}
var rocketryDogmas = function() {
   return [
   ]
}
var skyscrapersDogmas = function() {
   return [
   ]
}
var socialismDogmas = function() {
   return [
   ]
}
var collaborationDogmas = function() {
   return [
   ]
}
var compositesDogmas = function() {
   return [
   ]
}
var computersDogmas = function() {
   return [
   ]
}
var ecologyDogmas = function() {
   return [
   ]
}
var fissionDogmas = function() {
   return [
   ]
}
var geneticsDogmas = function() {
   return [
   ]
}
var satellitesDogmas = function() {
   return [
   ]
}
var servicesDogmas = function() {
   return [
   ]
}
var specializationDogmas = function() {
   return [
   ]
}
var suburbiaDogmas = function() {
   return [
   ]
}
var aiDogmas = function() {
   return [
   ]
}
var bioengineeringDogmas = function() {
   return [
   ]
}
var databasesDogmas = function() {
   return [
   ]
}
var globalizationDogmas = function() {
   return [
   ]
}
var miniaturizationDogmas = function() {
   return [
   ]
}
var roboticsDogmas = function() {
   return [
   ]
}
var selfServiceDogmas = function() {
   return [
   ]
}
var softwareDogmas = function() {
   return [
   ]
}
var stemCellsDogmas = function() {
   return [
   ]
}
var theInternetDogmas = function() {
   return [
   ]
}

var cards = {
      "Agriculture": new Card( "Agriculture", 1, types.Yellow, types.Hex, types.Leaf,
                            types.Leaf, types.Leaf, types.Leaf, AgricultureDogmas ),

      "Archery": new Card( "Archery", 1, types.Red, types.Castle, types.Lightbulb,
                         types.Hex, types.Castle, types.Castle, ArcheryDogmas ),
      "City States": new Card( "City States", 1, types.Purple, types.Hex, types.Crown,
                               types.Crown, types.Castle, types.Crown, CityStatesDogmas ),
      "Clothing": new Card( "Clothing", 1, types.Green, types.Hex, types.Crown, types.Leaf,
                          types.Leaf, types.Leaf, ClothingDogmas ),
      "Code of Laws": new Card( "Code of Laws", 1, types.Purple, types.Hex, types.Crown,
                                types.Crown, types.Leaf, types.Crown, CodeOfLawsDogmas ),
      "Domestication": new Card( "Domestication", 1, types.Yellow, types.Castle, types.Crown,
                               types.Hex, types.Castle, types.Castle, domesticationDogmas ),
      "Masonry": new Card( "Masonry", 1, types.Yellow, types.Castle, types.Hex, types.Castle,
                         types.Castle, types.Castle, masonryDogmas ),
      "Metalworking": new Card( "Metalworking", 1, types.Red, types.Castle, types.Castle,
                              types.Hex, types.Castle, types.Castle, metalworkingDogmas ),
      "Mysticism": new Card( "Mysticism", 1, types.Purple, types.Hex, types.Castle, types.Castle,
                           types.Castle, types.Castle, mysticismDogmas ),
      "Oars": new Card( "Oars", 1, types.Red, types.Castle, types.Crown, types.Hex, types.Castle,
                      types.Castle, oarsDogmas ),
      "Pottery": new Card( "Pottery", 1, types.Blue, types.Hex, types.Leaf, types.Leaf,
                         types.Leaf, types.Leaf, potteryDogmas ),
      "Sailing": new Card( "Sailing", 1, types.Green, types.Crown, types.Crown, types.Hex,
                         types.Leaf, types.Crown, sailingDogmas ),
      "The Wheel": new Card( "The Wheel", 1, types.Green, types.Hex, types.Castle,
                             types.Castle, types.Castle, types.Castle, theWheelDogmas ),
      "Tools": new Card( "Tools", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb,
                         types.Castle, types.Lightbulb, toolsDogmas ),
      "Writing": new Card( "Writing", 1, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb,
                           types.Crown, types.Lightbulb, writingDogmas ),
      "Calendar": new Card( "Calendar", 2, types.Blue, types.Hex, types.Leaf, types.Leaf,
                            types.Lightbulb, types.Leaf, calendarDogmas ),
      "Canal Building": new Card( "Canal Building", 2, types.Yellow, types.Hex, types.Crown,
                                  types.Leaf, types.Crown, types.Crown, canalBuildingDogmas ),
      "Currency": new Card( "Currency", 2, types.Green, types.Leaf, types.Crown, types.Hex,
                            types.Crown, types.Crown, currencyDogmas ),
      "Construction": new Card( "Construction", 2, types.Red, types.Castle, types.Hex, types.Castle,
                                types.Castle, types.Castle, constructionDogmas ),
      "Fermenting": new Card( "Fermenting", 2, types.Yellow, types.Leaf, types.Leaf,
                              types.Hex, types.Castle, types.Leaf, fermentingDogmas ),
      "Mapmaking": new Card( "Mapmaking", 2, types.Green, types.Hex, types.Crown, types.Crown, types.Castle, types.Crown, mapmakingDogmas ),
      "Mathematics": new Card( "Mathematics", 2, types.Blue, types.Hex,
                               types.Lightbulb, types.Crown, types.Lightbulb,
                               types.Lightbulb, mathematicsDogmas ),
      "Monotheism": new Card( "Monotheism", 2, types.Purple, types.Hex, types.Castle, types.Castle, types.Castle, types.Castle, monotheismDogmas ),
      "Philosophy": new Card( "Philosophy", 2, types.Purple, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, philosophyDogmas ),
      "Road Building": new Card( "Road Building", 2, types.Red, types.Castle, types.Castle, types.Hex, types.Castle, types.Castle, roadBulidingDogmas ),
      "Alchemy": new Card( "Alchemy", 3, types.Blue, types.Hex, types.Leaf, types.Castle, types.Castle, types.Castle, alchemyDogmas ),
      "Compass": new Card( "Compass", 3, types.Green, types.Hex, types.Crown, types.Crown, types.Leaf, types.Crown, compassDogmas ),
      "Education": new Card( "Education", 3, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, educationDogmas ),
      "Engineering": new Card( "Engineering", 3, types.Red, types.Castle, types.Hex, types.Lightbulb, types.Castle, types.Castle, engineeringDogmas ),
      "Feudalism": new Card( "Feudalism", 3, types.Purple, types.Hex, types.Castle, types.Leaf, types.Castle, types.Castle, feudalismDogmas ),
      "Machinery": new Card( "Machinery", 3, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Castle, types.Leaf, machineryDogmas ),
      "Medicine": new Card( "Medicine", 3, types.Yellow, types.Crown, types.Leaf, types.Leaf, types.Hex, types.Leaf, medicineDogmas ),
      "Optics": new Card( "Optics", 3, types.Red, types.Crown, types.Crown, types.Crown, types.Hex, types.Crown, opticsDogmas ),
      "Paper": new Card( "Paper", 3, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, paperDogmas ),
      "Translation": new Card( "Translation", 3, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, translationDogmas ),
      "Anatomy": new Card( "Anatomy", 4, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, anatomyDogmas ),
      "Colonialism": new Card( "Colonialism", 4, types.Red, types.Hex, types.Factory, types.Lightbulb, types.Factory, types.Factory, colonialismDogmas ),
      "Enterprise": new Card( "Enterprise", 4, types.Purple, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, enterpriseDogmas ),
      "Experimentation": new Card( "Experimentation", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Lightbulb, experimentationDogmas ),
      "Gunpowder": new Card( "Gunpowder", 4, types.Red, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, gunpowderDogmas ),
      "Invention": new Card( "Invention", 4, types.Green, types.Hex, types.Lightbulb, types.Lightbulb, types.Factory, types.Lightbulb, inventionDogmas ),
      "Navigation": new Card( "Navigation", 4, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, navigationDogmas ),
      "Perspective": new Card( "Perspective", 4, types.Yellow, types.Hex, types.Lightbulb, types.Lightbulb, types.Leaf, types.Lightbulb, perspectiveDogmas ),
      "Printing Press": new Card( "Printing Press", 4, types.Blue, types.Hex, types.Lightbulb, types.Lightbulb, types.Crown, types.Lightbulb, printingPressDogmas ),
      "Reformation": new Card( "Reformation", 4, types.Purple, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, reformationDogmas ),
      "Astronomy": new Card( "Astronomy", 5, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, astronomyDogmas ),
      "Banking": new Card( "Banking", 5, types.Green, types.Factory, types.Crown, types.Hex, types.Crown, types.Crown, bankingDogmas ),
      "Chemistry": new Card( "Chemistry", 5, types.Blue, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, chemistryDogmas ),
      "Coal": new Card( "Coal", 5, types.Red, types.Factory, types.Factory, types.Factory, types.Hex, types.Factory, coalDogmas ),
      "Measurement": new Card( "Measurement", 5, types.Green, types.Lightbulb, types.Leaf, types.Lightbulb, types.Hex, types.Lightbulb, measurementDogmas ),
      "Physics": new Card( "Physics", 5, types.Blue, types.Factory, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, physicsDogmas ),
      "Societies": new Card( "Societies", 5, types.Purple, types.Crown, types.Hex, types.Lightbulb, types.Crown, types.Crown, societiesDogmas ),
      "Statistics": new Card( "Statistics", 5, types.Yellow, types.Leaf, types.Lightbulb, types.Leaf, types.Hex, types.Leaf, statisticsDogmas ),
      "Steam Engine": new Card( "Steam Engine", 5, types.Yellow, types.Hex, types.Factory, types.Crown, types.Factory, types.Factory, steamEngineDogmas ),
      "The Pirate Code": new Card( "The Pirate Code", 5, types.Red, types.Crown, types.Factory, types.Crown, types.Hex, types.Crown, thePirateCodeDogmas ),
      "Atomic Theory": new Card( "Atomic Theory", 6, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, atomicTheoryDogmas ),
      "Canning": new Card( "Canning", 6, types.Yellow, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, canningDogmas ),
      "Classification": new Card( "Classification", 6, types.Green, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, classificationDogmas ),
      "Democracy": new Card( "Democracy", 6, types.Purple, types.Crown, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, democracyDogmas ),
      "Emancipation": new Card( "Emancipation", 6, types.Purple, types.Factory, types.Lightbulb, types.Factory, types.Hex, types.Factory, emancipationDogmas ),
      "Encyclopedia": new Card( "Encyclopedia", 6, types.Blue, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, encyclopediaDogmas ),
      "Industrialization": new Card( "Industrialization", 6, types.Red, types.Crown, types.Factory, types.Factory, types.Hex, types.Factory, industrializationDogmas ),
      "Machine Tools": new Card( "Machine Tools", 6, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, machineToolsDogmas ),
      "Metric System": new Card( "Metric System", 6, types.Green, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, metricSystemDogmas ),
      "Vaccination": new Card( "Vaccination", 6, types.Yellow, types.Leaf, types.Factory, types.Leaf, types.Hex, types.Leaf, vaccinationDogmas ),
      "Bicycle": new Card( "Bicycle", 7, types.Green, types.Crown, types.Crown, types.Clock, types.Hex, types.Crown, bicycleDogmas ),
      "Combustion": new Card( "Combustion", 7, types.Red, types.Crown, types.Crown, types.Factory, types.Hex, types.Crown, combustionDogmas ),
      "Electricity": new Card( "Electricity", 7, types.Green, types.Lightbulb, types.Factory, types.Hex, types.Factory, types.Factory, electricityDogmas ),
      "Evolution": new Card( "Evolution", 7, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, evolutionDogmas ),
      "Explosives": new Card( "Explosives", 7, types.Red, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, explosivesDogmas ),
      "Lighting": new Card( "Lighting", 7, types.Purple, types.Hex, types.Leaf, types.Clock, types.Leaf, types.Leaf, lightingDogmas ),
      "Publications": new Card( "Publications", 7, types.Blue, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, publicationsDogmas ),
      "Railroad": new Card( "Railroad", 7, types.Purple, types.Clock, types.Factory, types.Clock, types.Hex, types.Clock, railroadDogmas ),
      "Refrigeration": new Card( "Refrigeration", 7, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Crown, types.Leaf, refrigerationDogmas ),
      "Sanitation": new Card( "Sanitation", 7, types.Yellow, types.Leaf, types.Leaf, types.Hex, types.Leaf, types.Leaf, sanitationDogmas ),
      "Antibiotics": new Card( "Antibiotics", 8, types.Yellow, types.Leaf, types.Leaf, types.Leaf, types.Hex, types.Leaf, antibioticsDogmas ),
      "Corporations": new Card( "Corporations", 8, types.Green, types.Hex, types.Factory, types.Factory, types.Crown, types.Factory, corporationsDogmas ),
      "Empiricism": new Card( "Empiricism", 8, types.Purple, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, empiricismDogmas ),
      "Flight": new Card( "Flight", 8, types.Red, types.Crown, types.Hex, types.Clock, types.Crown, types.Crown, flightDogmas ),
      "Mass Media": new Card( "Mass Media", 8, types.Green, types.Lightbulb, types.Hex, types.Clock, types.Lightbulb, types.Lightbulb, massMediaDogmas ),
      "Mobility": new Card( "Mobility", 8, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, mobilityDogmas ),
      "Quantum Theory": new Card( "Quantum Theory", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, quantumTheoryDogmas ),
      "Rocketry": new Card( "Rocketry", 8, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, rocketryDogmas ),
      "Skyscrapers": new Card( "Skyscrapers", 8, types.Yellow, types.Hex, types.Factory, types.Crown, types.Crown, types.Crown, skyscrapersDogmas ),
      "Socialism": new Card( "Socialism", 8, types.Purple, types.Leaf, types.Hex, types.Leaf, types.Leaf, types.Leaf, socialismDogmas ),
      "Collaboration": new Card( "Collaboration", 9, types.Green, types.Hex, types.Crown, types.Clock, types.Crown, types.Crown, collaborationDogmas ),
      "Composites": new Card( "Composites", 9, types.Red, types.Factory, types.Factory, types.Hex, types.Factory, types.Factory, compositesDogmas ),
      "Computers": new Card( "Computers", 9, types.Blue, types.Clock, types.Hex, types.Clock, types.Factory, types.Clock, computersDogmas ),
      "Ecology": new Card( "Ecology", 9, types.Yellow, types.Leaf, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, ecologyDogmas ),
      "Fission": new Card( "Fission", 9, types.Red, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, fissionDogmas ),
      "Genetics": new Card( "Genetics", 9, types.Blue, types.Lightbulb, types.Lightbulb, types.Lightbulb, types.Hex, types.Lightbulb, geneticsDogmas ),
      "Satellites": new Card( "Satellites", 9, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, satellitesDogmas ),
      "Services": new Card( "Services", 9, types.Purple, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, servicesDogmas ),
      "Specialization": new Card( "Specialization", 9, types.Purple, types.Hex, types.Factory, types.Leaf, types.Factory, types.Factory, specializationDogmas ),
      "Suburbia": new Card( "Suburbia", 9, types.Yellow, types.Hex, types.Crown, types.Leaf, types.Leaf, types.Leaf, suburbiaDogmas ),
      "A.I.": new Card( "A.I.", 10, types.Purple, types.Lightbulb, types.Lightbulb, types.Clock, types.Hex, types.Clock, aiDogmas ),
      "Bioengineering": new Card( "Bioengineering", 10, types.Blue, types.Lightbulb, types.Clock, types.Clock, types.Hex, types.Clock, bioengineeringDogmas ),
      "Databases": new Card( "Databases", 10, types.Green, types.Hex, types.Clock, types.Clock, types.Clock, types.Clock, databasesDogmas ),
      "Globalization": new Card( "Globalization", 10, types.Yellow, types.Hex, types.Factory, types.Factory, types.Factory, types.Factory, globalizationDogmas ),
      "Miniaturization": new Card( "Miniaturization", 10, types.Red, types.Hex, types.Lightbulb, types.Clock, types.Lightbulb, types.Lightbulb, miniaturizationDogmas ),
      "Robotics": new Card( "Robotics", 10, types.Red, types.Hex, types.Factory, types.Clock, types.Factory, types.Factory, roboticsDogmas ),
      "Self Service": new Card( "Self Service", 10, types.Green, types.Hex, types.Crown, types.Crown, types.Crown, types.Crown, selfServiceDogmas ),
      "Software": new Card( "Software", 10, types.Blue, types.Clock, types.Clock, types.Clock, types.Hex, types.Clock, softwareDogmas ),
      "Stem Cells": new Card( "Stem Cells", 10, types.Yellow, types.Hex, types.Leaf, types.Leaf, types.Leaf, types.Leaf, stemCellsDogmas ),
      "The Internet": new Card( "The Internet", 10, types.Purple, types.Hex, types.Clock, types.Clock, types.Lightbulb, types.Clock, theInternetDogmas )
}
exports.Cards = cards;

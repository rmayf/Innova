#!/usr/local/bin/node
var engine = require( './engine.js' )
var net = require( 'net' )
var struct = require( 'struct' )
var log = require( 'bunyan' ).createLogger( { name: 'Innova' } )

function GameRecord( game, numPlayers, creator, key ) {
   this.game = game;
   this.creator = creator
   this.numPlayers = numPlayers
   this.players = {}
   this.players[ creator ] = { key: makeKey(), sock: null }
   this.playerName = [ creator ]
   this.inProgress = false;
   this.gameKey = key
}

var keyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
exports.keyChars = keyChars;
var keySize = 16;
exports.keySize = keySize;
var server = null;
var actionCreate = 'create'
exports.actionCreate = actionCreate
var actionJoin = 'join'
exports.actionJoin = actionJoin
var actionQuery = 'query'
exports.actionQuery = actionQuery
var actionStream = 'stream'
exports.actionStream = actionStream
var actionUpdate = 'update'
exports.actionUpdate = actionUpdate
var actionReaction = 'reaction'
exports.actionReaction = actionReaction

exports.Server = function( port ) {
   this.port = port;
   this.streamingPort = port + 1;
   var streamingPort = this.streamingPort
   this.activeGames = {};
   var activeGames = this.activeGames;
   var defaultBufSize = 1024
   var lookupGame = function( req, sock ) {
      var gameRec = activeGames[ req.gameKey ]
      if( !gameRec ) {
         log.error( '%s:%d no game with key: %s', sock.remoteAddress,
                    sock.remotePort, req.gameKey )
         sock.end( JSON.stringify( { error: true,
                                     message: 'no game with key',
                                     gameKey: req.gameKey } ) )
         return null
      } else if( !gameRec.players[ req.name ] ) {
         log.error( '%s:%d %s not in game %s', sock.remoteAddress,
                    sock.remotePort, req.name, req.gameKey )
         sock.end( JSON.stringify( { error: true,
                                     message: 'player not in game',
                                     name: req.name } ) )
         return null
      } else if( gameRec.players[ req.name ].key !== req.playerKey ) {
         log.error( '%s:%d wrong playerKey: %s', sock.remoteAddress,
                    sock.remotePort, req.playerKey )
         sock.end( JSON.stringify( { error: true,
                                     message: 'wrong playerKey',
                                     playerKey: req.playerKey } ) )
         return null
      } else if( gameRec.inProgress == false ) {
         log.error( '%s:%d game not in progress', sock.remoteAddress,
                    sock.remotePort )
         sock.end( JSON.stringify( { error: true,
                                     message: 'game not in progress' } ) )

         return null
      }
      return gameRec
   }
   this._server = net.createServer( function( sock ) {
   // serialize GameRecord
   /*
                  sock.end( JSON.stringify( activeGames[ key ], function( k, v ) {
                     if( k === '' ) {
                        v.key = key
                     } 
                     if( k === 'game' || k === 'spotsLeft' ) {
                        return undefined
                     }
                     return v
                  } ) )
      */
      sock.on( 'data', function( data ) {
         try {
            var req = JSON.parse( data )
         } catch( e ) {
            log.error( e, '%s:%d', sock.remoteAddress, sock.remotePort )
            sock.end( JSON.stringify( { error: true,
                                        message: e.message } ) )
            return
         }
         log.info( req, '%s:%d', sock.remoteAddress, sock.remotePort )
         switch( req.action ) {
            case actionCreate:
               new engine.Game( req.players, req.achievements, function( e, game ) {
                  if( e ) {
                     log.error( e, '%s:%d', sock.remoteAddress, sock.remotePort )
                     sock.end( JSON.stringify( { error: true,
                                                 message: e.message } ) )
                     return
                  }
                  var key_ = makeKey()
                  while( activeGames[ key_ ] ) {
                     log.warn( '%s duplicate key', key_ )
                     key_ = makeKey();
                  }
                  activeGames[ key_ ] = new GameRecord( game, req.players, req.name, key_ );
                  sock.end( JSON.stringify( { gameKey: key_, 
                                              playerKey: activeGames[ key_ ].players[ req.name ].key } ) )
               } );
               break;
            case actionJoin:
               var gameRec = activeGames[ req.gameKey ]
               var name = req.name
               if( !gameRec ) {
                  log.error( '%s:%d no game with key: %s',
                             sock.remoteAddress, sock.remotePort, req.key ) 
                  sock.end( JSON.stringify( { error: true,
                                              message: 'no game with key',
                                              key: req.key } ) )
                  return
               } else if( gameRec.players[ name ] == undefined &&
                          gameRec.playerName.length == gameRec.numPlayers ) {
                  log.error( '%s:%d no spots left', sock.remoteAddress, sock.remotePort )
                  sock.end( JSON.stringify( { error: true,
                                              message: 'game is full',
                                              key: req.key } ) )
                  return
               } else if( gameRec.players[ name ] == undefined ) {
                  // this player will be joining this game
                  gameRec.playerName.push( name )
               }

               // client is requesting a new connection
               gameRec.players[ name ] = { key: makeKey(),
                                           sock: null }
               if( gameRec.playerName.length == gameRec.numPlayers && gameRec.inProgress == false ) {
                  // start the game
                  gameRec.game.begin( gameRec.playerName )
                  gameRec.inProgress = true
               }
               
               sock.end( JSON.stringify( { playerKey: gameRec.players[ req.name ].key } ) )
               break
            case actionUpdate:
               var gameRec = lookupGame( req, sock )
               if( gameRec ) {
                  sock.end( gameRec.game.serialize( req.name ) )
               }
               break
            case actionStream:
               break
            case actionQuery:
               break
            case actionReaction:
               var gameRec = lookupGame( req, sock )
               if( gameRec ) {
                  try { 
                     gameRec.game.reaction( req.name, req.answer )
                  } catch( e ) {
                     log.error( e )
                     sock.end( JSON.stringify( { error: true,
                                                 message: e.message } ) )
                  }
               }
               break
            default:
               var gameRec = lookupGame( req, sock )
               if( gameRec ) {
                  var target
                  if( req.age === undefined ) {
                     target = req.card
                  } else {
                     target = req.age
                  }
                  try {
                     gameRec.game.action( req.name, req.action, target )
                  } catch( e ) {
                     log.error( e )
                     sock.end( JSON.stringify( { error: true,
                                                 message: e.message } ) )
                  }
               }
         }
      } )
   } ).listen( port, function() {
      log.info( 'Innova started on port %d', port )
   } );
   this.close = function() {
      this._server.close();
   }
}

function makeKey() {
    var text = "";
    for( var i=0; i < 16; i++ )
        text += keyChars.charAt(Math.floor(Math.random() * keyChars.length));
    return text;
}

if( require.main === module ) {
   if( process.argv.length != 3 ) {
      log.fatal( 'no port number specified' )
      process.exit( 1 );
   }
   server = exports.Server( process.argv[ 2 ] );
}

#!/usr/local/bin/node
var engine = require( './engine.js' );
var net = require( 'net' );
var struct = require( 'struct' );

function GameRecord( game, numPlayers ) {
   this.game = game;
   this.spotsLeft = numPlayers;
   this.players = [];
}

var respError = 'E'.charCodeAt();
exports.respError = respError;
var respSuccess = 'S'.charCodeAt();
exports.respSuccess = respSuccess;
var reqJoinGame = 'j'.charCodeAt();
exports.reqJoinGame = reqJoinGame;
var reqNewGame = 'n'.charCodeAt();
exports.reqNewGame = reqNewGame;
var keyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
exports.keyChars = keyChars;
var keySize = 16;
exports.keySize = keySize;
var server = null;

exports.Server = function( port ) {
   this.port = port;
   this.streamingPort = port + 1;
   var streamingPort = this.streamingPort
   this.activeGames = {};
   var activeGames = this.activeGames;
   this._server = net.createServer( function( sock ) {
      console.log( 'new connection ' + sock.remoteAddress );
      sock.on( 'data', function( data ) {
         var header = struct()
            .word8( 'type' )
         header._setBuff( data );
         switch( header.get( 'type' ) ) {
            case reqNewGame:
               var newGame = struct()
                  .struct( 'header', header )
                  .word8( 'numPlayers' )
                  .word8( 'numAchievements' )
               newGame._setBuff( data );
               var req = newGame.fields;
               var game = new engine.Game( req.numPlayers, req.numAchievements, function( e ) {
                  var resp = struct()
                     .word8( 'type' )
                     .chars( 'key', keySize )
                     .allocate()
                  if( e ) {
                     var err = struct()
                        .word8( 'type' )
                        .word8( 'size' )
                        .chars( 'message', e.message.length )
                        .allocate()
                     err.set( 'type', respError );
                     err.set( 'size', e.message.length ); 
                     err.set( 'message', e.message );
                     sock.end( err.buffer() );
                     return
                  }
                  var key = makeKey()
                  while( activeGames[ key ] ) {
                     console.log( 'Duplicate key ' + key );
                     key = makeKey();
                  }
                  activeGames[ key ] = new GameRecord( game, req.numPlayers );
                  resp.set( 'type', respSuccess );
                  resp.buffer().write( key, 1 );
                  sock.end( resp.buffer() );
               } );
               break;
            case reqJoinGame:
               console.log( "join game" );
               var joinGame = struct()
                  .word8( 'type' )
                  .chars( 'key', keySize )
                  .word8( 'nameSize' )
               var err = struct
               joinGame._setBuff( data )
               var key = joinGame.get( 'key' )
               var gameRec = activeGames[ key ]
               if( gameRec == null ) {
                  var msg = 'key error: game does not exist with the id: ' + key
                  var err = struct()
                     .word8( 'type' )
                     .word8( 'size' )
                     .chars( 'message', e.message.length )
                     .allocate()
                  err.set( 'type', respError )
                  err.set( 'size', msg.length )
                  err.set( 'message', msg )
                  sock.end( err.buffer() )
                  return
               }
               //joinGame.chars( 'name', joinGame.get( 'nameSize' ) )
               var name = data.slice( keySize + joinGame.get( 'nameSize' ) + 2, data.length )
               if( gameRec.players[ name ] == null && gameRec.spotsLeft == 0 ) {
                  var msg = 'The game is already full'
                  var err = struct()
                     .word8( 'type' )
                     .word8( 'size' )
                     .chars( 'message', e.message.length )
                     .allocate()
                  err.set( 'type', respError )
                  err.set( 'size', msg.length )
                  err.set( 'message', msg )
                  sock.end( err.buffer() )
                  return
               } 
               // add the new key to the player map
               gameRec.players[ name ] = { key: makeKey(),
                                      sock: null }
               // return the key
               var resp = struct()
                  .word8( 'type' )
                  .chars( 'key', keySize )
                  .word16Ube( 'port' )
                  .allocate()
               proxy = resp.fields
               proxy.type = respSuccess
               proxy.key = gameRec.players[ name ].key
               proxy.port = streamingPort
               if( gameRec.spotsLeft > 0 ) {
                  gameRec.spotsLeft--
               }
               sock.end( resp.buffer() )
               break;
            default:
               console.log( 'bad message type: ' + header.get( 'type' ) )
               sock.end( 'Error: you suck, go away' );
         }
      } )
   } ).listen( port, function() {
      console.log( 'Innovation server is live on ' + port );
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
      console.log( 'no port specified' );
      process.exit( 1 );
   }
   server = exports.start( process.argv[ 2 ] );
}

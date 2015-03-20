#!/usr/local/bin/node
var engine = require( './engine.js' );
var net = require( 'net' );
var struct = require( 'struct' );





function GameRecord( game, numPlayers ) {
   this.game = game;
   this.numPlayers = numPlayers;
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
exports.activeGames;
var server = null;

exports.kill = function() {
   server.close();
} 
exports.start = function( port ) {
   server = net.createServer( function( sock ) {
      console.log( 'new connection ' + sock.remoteAddress );
      exports.activeGames = {};
      sock.on( 'data', function( data ) {
         var header = struct()
            .word8( 'type' )

         var newGame = struct()
            .struct( 'header', header )
            .word8( 'numPlayers' )
            .word8( 'numAchievements' )
         header._setBuff( data );
         switch( header.get( 'type' ) ) {
            case reqNewGame:
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
                     return;
                  }
                  var key = makeKey()
                  while( exports.activeGames[ key ] ) {
                     console.log( 'Duplicate key ' + key );
                     key = makeKey();
                  }
                  exports.activeGames[ key ] = new GameRecord( game, req.numPlayers );
                  resp.set( 'type', respSuccess );
                  resp.buffer().write( key, 1 );
                  sock.end( resp.buffer() );
               } );
               break;
            case reqJoinGame:
               console.log( "join game" );
               break;
            default:
               console.log( 'bad message type' );
               sock.end( 'you suck, go away' );
         }
      } )
   } ).listen( port, function() {
      console.log( 'Innovation server is live on ' + port );
   } );
}

exports.stop = function() {
   server.close();    
}

if( require.main === module ) {
   if( process.argv.length != 3 ) {
      console.log( 'no port specified' );
      process.exit( 1 );
   }
   exports.start( process.argv[ 2 ] );
}

function makeKey() {
    var text = "";

    for( var i=0; i < 16; i++ )
        text += keyChars.charAt(Math.floor(Math.random() * keyChars.length));

    return text;
}

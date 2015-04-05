#!/usr/local/bin/node


var net = require( 'net' )
var readline = require( 'readline' )
var rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});

var gameKey
var playerKey
var port
var name
if( require.main === module ) {
      port = process.argv[ 2 ]
      name = process.argv[ 3 ]
   if( process.argv.length == 5 ) {
      gameKey = process.argv[ 4 ]
   }
}

var rx = ''

// create the game
if( !gameKey ) {
   var client = net.connect( port )
                   .on( 'data', function( resp ) {
                     rx += resp
                   } )
                   .on( 'close', function( e ) {
                     var resp = JSON.parse( rx )  
                     gameKey = resp.gameKey
                     console.log( gameKey )
                     playerKey = resp.playerKey
                     waitForGameToStart()
                  } )
                   .write( JSON.stringify( { action: 'create',
                                             name: name,
                                             players: 2,
                                             achievements: 6 } ) )
} else {
   var client = net.connect( port )
                   .on( 'data', function( resp ) {
                     rx += resp
                   } )
                   .on( 'close', function( e ) {
                     var resp = JSON.parse( rx )  
                     playerKey = resp.playerKey
                     waitForGameToStart()
                  } )
                   .write( JSON.stringify( { action: 'join',
                                             name: name,
                                             gameKey: gameKey } ) )

}


function waitForGameToStart() {
   var rx = ''
   var client = net.connect( port )
                   .on( 'data', function( resp ) {
                     rx += resp
                   } )
                   .on( 'close', function( e ) {
                     resp = JSON.parse( rx )  
                     if( resp.error ) {
                        waitForGameToStart()
                     } else {
                        if( resp.turn == 0 && resp.decision != null ) {
                           rl.question( 'meld [ ' + resp.hand[ 0 ] + ', ' + resp.hand[ 1 ] + ' ]\n>', function( ans ) {
                              var rx = ''
                              var client = net.connect( port )
                                              .write( JSON.stringify( { action: 'reaction',
                                                                        answer: ans,
                                                                        name: name,
                                                                        playerKey: playerKey,
                                                                        gameKey: gameKey } ) )
                              startCli() 
                           } )
                        } else {
                           startCli()
                        }
                     }
                  } )
                   .write( JSON.stringify( { action: 'update',
                                             name: name,
                                             playerKey: playerKey,
                                             gameKey: gameKey } ) )
}

function startCli() {
   function repeat() {
      var client = net.connect( port )
      rl.question( '>', function( ans ) {
         switch( ans ) {
            case 'update':
               var rx = ''
               client.on( 'data', function( data ) {
                     rx += data
                  } )
                  .on( 'close', function( e) {
                     console.log( JSON.parse( rx ) )
                     repeat()
                  } )
                  .write( JSON.stringify( { action: 'update',
                                          name: name,
                                          playerKey: playerKey,
                                          gameKey: gameKey } ) )
               break
            case 'draw':
               client.write( JSON.stringify( { action: 'draw',  
                                                name: name,
                                                playerKey: playerKey,
                                                gameKey: gameKey } ) )
               repeat()
               break
            default:
               repeat()
         }
      } )
   }
   repeat()
}

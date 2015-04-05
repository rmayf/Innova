#!/usr/local/bin/node
var engine = require( '../engine.js' );
var net = require( 'net' );
var serverHelper = require( '../server.js' );
var Server = serverHelper.Server;
var expect = require( 'chai' ).expect;

var port = 1050;
function portNum() {
   port += 1;
   return port;   
}

function sendReq( client, tx, done ) {
   var chunkSize = 512
   var rx = ''
   var rxLength = 0;
   client.on( 'data', function( data ) {
      rx += data
   } )
   client.on( 'close', function( e ) {
      done( JSON.parse( rx ) );
   } )
   client.write( tx )
}

function sendNewGameReq( client, done, name, numPlayers, numAchievements ) {
   // Javascript's dumb way of setting default function parameters...
   numPlayers = numPlayers || 2;
   numAchievements = numAchievements || 6;
   name = name || 'player'

   var newGame = { action: serverHelper.actionCreate,
                   name: name,
                   players: numPlayers,
                   achievements: numAchievements
                 }
   sendReq( client, JSON.stringify( newGame ), done );
}

function newClient( port ) {
   return net.connect( port );
}

function startBasicGame( done ) {
   var serv = new Server( portNum() );
   var client = newClient( serv.port );
   sendNewGameReq( client, function( data ) {
      done( data );
   } )
   return serv;
}

describe( 'Invalid Request', function() {
   var server
   before( function() {
      server = new Server( portNum() );
   } )
   after( function() {
      server.close();
   } )
   it( 'JSON parse error', function( done ) {
      sendReq( newClient( server.port ),
               'please crash mister server', function( resp ) {
         expect( resp.error ).to.be.true
         done()
      } )
   } )
   it( 'unrecognized action field', function( done ) {
      sendReq( newClient( server.port ),
               JSON.stringify( { action: "suckaDICK" } ), function( resp ) {
         expect( resp.error ).to.be.true 
         done()
      } )
   } )
} )

describe( 'NewGame Request', function() {
   var resp
   var server
   describe( 'valid', function() {
      before( function( done ) {
         server = startBasicGame( function( data ) {
            resp = data
            done()
         } )
      } )
      after( function() {
         server.close()
      } )

      it( 'Success response type', function() {
         expect( resp.error ).to.be.undefined
      } );
      it( 'key has valid format', function() {
         var regexStr = '[' + serverHelper.keyChars + ']{' + serverHelper.keySize + '}';
         expect( resp.gameKey ).to.match( new RegExp( regexStr, 'i' ) )    
         expect( resp.playerKey ).to.match( new RegExp( regexStr, 'i' ) )    
      } )
      it( 'server created game', function() {
         var gameRecord = server.activeGames[ resp.gameKey ];
         expect( gameRecord ).to.not.be.empty;
         expect( gameRecord.game ).to.not.be.undefined
         expect( gameRecord.playerName.length ).to.equal( 1 );
         expect( gameRecord.inProgress ).to.be.false
         expect( gameRecord.players[ 'player' ] ).to.not.be.undefined
         expect( gameRecord.players[ 'player' ].key ).to.equal( resp.playerKey )
         expect( gameRecord.players[ 'player' ].sock ).to.be.null
      } )
   } )
   
   describe( 'invalid', function() {
      var resp;
      var server;
      before( function( done ) {
         server = new Server( portNum() );
         client = newClient( server.port );
         sendNewGameReq( client, function( resp_ ) {
            resp = resp_
            done()
         }, 'bilbo baggins', 5 )
      } )
      after( function() {
         server.close();
      } )

      it( 'Error response type', function() {
         expect( resp.error ).to.be.true
      } )
   } )
} )

describe ( 'JoinGame Request', function() {
   var server
   var key_
   before( function( done ) {
      server = startBasicGame( function( data ) {
         key_ = data.gameKey
         done()
      } )
   } )
   after( function() {
      server.close();
   } )
   describe( 'ValidRequests', function() {
      var resp
      var name = 'bilbo'
      before( function( done ) {
         var client = newClient( server.port );
         var join = { action: serverHelper.actionJoin,
                      gameKey: key_,
                      name: name }
         sendReq( client, JSON.stringify( join ), function( data_ ) {
            resp = data_;
            done()
         } )
      } )
      it( 'Success response type', function() {
         expect( resp.error ).to.be.undefined
      } )
      it( 'Server added player to gameRecord', function() {
         expect( server.activeGames[ key_ ].players[ name ].key )
                     .to.equal( resp.playerKey )
      } )
      it( 'Client reconnect doesn\'t add new player', function() {
         var client = newClient( server.port );
         var join = { action: serverHelper.actionJoin,
                      gameKey: key_,
                      name: name }
         sendReq( client, JSON.stringify( join ), function( data ) {
            expect( data.error ).to.be.undefined
            var gameRec = server.activeGames[ key_ ]
            expect( gameRec ).to.not.be.undefined
            expect( gameRec.players[ name ] ).to.not.be.undefined
            expect( gameRec.game ).to.not.be.undefined
            expect( gameRec.players[ name ].sock ).to.be.null
            expect( gameRec.playerName.length ).to.equal( 2 )
         } )
      } )
      it( 'All players joined triggers game start', function() {
         expect( server.activeGames[ key_ ].playerName.length ).to.equal( 2 )
         expect( server.activeGames[ key_ ].inProgress ).to.be.true
      } )
   } )

   describe( 'Invalid join requests' ,function() {
      it( 'bad game key', function() {
         var client = newClient( server.port );
         var join = { action: serverHelper.actionJoin,
                      gameKey: 'aoeuaoeuaoeuaoeu',
                      name: 'naughtyDog' }
         sendReq( client, JSON.stringify( join ), function( data ) {
            expect( data.error ).to.be.true
         } )
      } )
      it( 'try to join a game that already started', function() {
         var client = newClient( server.port );
         var join = { action: serverHelper.actionJoin,
                      gameKey: key_,
                      name: 'naughtyDog' }
         sendReq( client, JSON.stringify( join ), function( data ) {
            expect( data.error ).to.be.true
            expect( server.activeGames[ key_ ].players[ 'naughtyDog' ] ).to.be.undefined
         } )
      } )
   } )
} )

describe( 'Update', function() {
   var server
   var gameKey
   var playerKey
   before( function( done ) {
      server = startBasicGame( function( resp_ ) {
         var resp = resp_
         gameKey = resp.gameKey
         var client = newClient( server.port )
         var join = { action: serverHelper.actionJoin,
                      gameKey: resp.gameKey,
                      name: 'bilbo' }
         sendReq( client, JSON.stringify( join ), function( data ) {
            playerKey = data.playerKey 
            done()
         } )
      } )
   } )
   after( function() {
      server.close()   
   } )
   it( 'player gets correct state', function() {
      var update = { action: serverHelper.actionUpdate,
                     name: 'bilbo',
                     playerKey: playerKey,
                     gameKey: gameKey }
      var client = newClient( server.port )
      sendReq( client, JSON.stringify( update ), function( resp ) {
         expect( resp.error ).to.be.undefined
         expect( resp.sharingDraw ).to.be.undefined
         expect( resp.agePiles[ 0 ] ).to.equal( 10 )
         expect( resp.achievements[ 0 ] ).to.equal( true )
         var bilbo = resp.players[ 0 ]
         var other = resp.players[ 1 ]
         if( bilbo.name != 'bilbo' ) {
            bilbo = other
            other = resp.players[ 0 ]
         }
         expect( bilbo.hand[ 0 ] ).to.not.equal( 1 )
         expect( other.hand[ 0 ] ).to.equal( 1 )
      } )
   } )
} )

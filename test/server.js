#!/usr/local/bin/node
var engine = require( '../engine.js' );
var net = require( 'net' );
var struct = require( 'struct' );
var serverHelper = require( '../server.js' );
var Server = serverHelper.Server;
var expect = require( 'chai' ).expect;

var port = 1050;
function portNum() {
   port += 1;
   return port;   
}

function newHeader() {
   return struct()
      .word8( 'type' )
}

function newResponse() {
   return struct()
      .word8( 'type' )
      .chars( 'key', serverHelper.keySize )
      .word16Ube( 'port' )
}

function newJoin( key, name ) {
   var join = struct()
      .word8( 'type' )
      .chars( 'key', serverHelper.keySize )
      .word8( 'nameSize' )
      .chars( 'name', name.length )
   var proxy = join.allocate().fields
   proxy.type = serverHelper.reqJoinGame;
   proxy.key = key;
   proxy.nameSize = name.length;
   proxy.name = name;
   return join;
}

function sendReq( client, tx, done ) {
   var chunkSize = 512
   var rx = new Buffer( chunkSize );
   var rxLength = 0;
   client.on( 'data', function( data ) {
      if( data.length > rx.length - rxLength ) {
         var bigBuf = new Buffer( rx.length + Math.max( chunkSize, data.length ) );
         rx.copy( bigBuf );
         rx = bigBuf;
      }
      data.copy( rx, rxLength );
      rxLength += data.length;
   } )
   client.on( 'close', function( e ) {
      done( rx );
   } )
   client.write( tx )
}

function sendNewGameReq( client, done, numPlayers, numAchievements ) {
   // Javascript's dumb way of setting default function parameters...
   numPlayers = numPlayers || 2;
   numAchievements = numAchievements || 6;

   var newGame = struct()
      .word8( 'type' )
      .word8( 'numPlayers' )
      .word8( 'numAchievements' )
      .allocate()

   var proxy = newGame.fields
   proxy.type = serverHelper.reqNewGame;
   proxy.numPlayers = numPlayers;
   proxy.numAchievements = numAchievements;
   sendReq( client, newGame.buffer(), done );
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

function successResponse( buf ) {
   checkHeader( buf, serverHelper.respSuccess );
}

function errorResponse( buf ) {
   checkHeader( buf, serverHelper.respError );
}


function checkHeader( buf, code ) {
   var header = struct()
      .word8( 'type' )
   var err = struct()
      .word8( 'type' )
      .word8( 'size' )
   header._setBuff( buf );
   if( header.type == serverHelper.respError ) {
      err._setBuff( buf )
      err.chars( 'message', err.get( 'size' ) )
      console.log( err.get( 'message' ) )
   }
   expect( header.get( 'type' ) ).to.equal( code );
}

describe( 'Invalid Request', function() {
   var rx;
   var server;
   var client;
   before( function( done ) {
      server = new Server( portNum() );
      client = newClient( server.port );
      var tx = newHeader()
         .allocate()
      tx.set( 'type', 0 ); 
      sendReq( client, tx.buffer(), function( data ) {
         rx = data;
         done();
      } )
   } )
   after( function() {
      server.close();
   } )
   it( 'Error response type', function() {
      errorResponse( rx );   
   } )
   it( 'no games created', function() {
      expect( Object.keys( server.activeGames ).length ).to.equal( 0 );
   } )
} )

describe( 'NewGame Request', function() {
   var resp = newResponse();
   var server;
   describe( 'valid', function() {
      before( function( done ) {
         server = startBasicGame( function( data ) {
            resp._setBuff( data );
            done();
         } )
      } )
      after( function() {
         server.close();
      } )

      it( 'Success response type', function() {
         successResponse( resp.buffer() );
      } );
      it( 'key has valid format', function() {
         var regexStr = '[' + serverHelper.keyChars + ']{' + serverHelper.keySize + '}';
         expect( resp.get( 'key' ) ).to.match( new RegExp( regexStr, 'i' ) )    
      } )
      it( 'server created game', function() {
         var gameRecord = server.activeGames[ resp.get( 'key' ) ];
         expect( gameRecord ).to.not.be.empty;
         expect( gameRecord.game ).to.not.be.undefined
         expect( gameRecord.spotsLeft ).to.equal( 2 );
      } )
   } )
   
   describe( 'invalid', function() {
      var rx;
      var server;
      var client;
      before( function( done ) {
         server = new Server( portNum() );
         client = newClient( server.port );
         sendNewGameReq( client, function( data ) {
            rx = data;
            done(); }, 7 );
      } )
      after( function() {
         server.close();
      } )

      it( 'Error response type', function() {
         errorResponse( rx );
      } )
   } )
} )
describe ( 'JoinGameRequest', function() {
   var server;
   var key;
   before( function( done ) {
      server = startBasicGame( function( data ) {
         var resp = newResponse();
         resp._setBuff( data );
         key = resp.get( 'key' );
         done()
      } )
   } )
   describe( 'ValidRequests', function() {
      var data;
      var req;
      var playerKey;
      var clName = 'testClient1'
      before( function( done ) {
         req = newJoin( key, 'testClient1' )
         var client = newClient( server.port );
         sendReq( client, req.buffer(), function( data_ ) {
            data = data_;
            done()
         } )
      } )
      after( function() {
         server.close();
      } )
      it( 'Success response type', function() {
         successResponse( data );
      } )
      it( 'Server added player to gameRecord', function() {
         var resp = newResponse()
         resp._setBuff( data )
         var players = server.activeGames[ key ].players
         expect( players[ clName ] ).to.not.be.undefined
         expect( server.activeGames[ key ].spotsLeft ).to.equal( 1 )
         playerKey = resp.get( 'key' )
         expect( server.activeGames[ key ].players[ clName ].key ).to.equal( playerKey )
      } )
      it( 'Client reconnect doesn\'t add new player', function() {
         var client = newClient( server.port );
         sendReq( client, req.buffer(), function( data ) {
            successResponse( data )
            var gameRec = server.activeGames[ key ]
            expect( gameRec ).to.not.be.undefined
            expect( gameRec.players[ clName ] ).to.not.be.undefined
            expect( gameRec.game ).to.not.be.undefined
            expect( gameRec.players[ clName ].sock ).to.be.null
            expect( gameRec.spotsLeft ).to.equal( 1 )
         } )
      } )
      it( 'All players joined triggers game start', function() {
         var join = newJoin( key, 'client2' )
         var client = newClient( server.port );
         sendReq( client, join.buffer(), function( data ) {
            successResponse( data )
            expect( server.activeGames[ key ].spotsLeft ).to.equal( 0 )
            expect( server.activeGames[ key ].began ).to.be.true
         } )
      } )
   } )
   describe( 'Invalid join requests' ,function() {
      it( 'bad game key', function() {
         it( 'bad key return error', function() {
            var join = newJoin( 'badgamekeyiiiiii', 'naughtyDog' )
            var client = newClient( server.port );
            sendReq( client, join.buffer(), function( data ) {
               errorResponse( data )
            } )
         } )
         it( 'try to join a game that already started', function() {
            var join = newJoin( key, 'client2' )
            var client = newClient( server.port );
            sendReq( client, join.buffer(), function( data ) {
               client = newClient( server.port )
               join = newJoin( key, 'naughtydog' )
               sendReq( client, join.buffer(), function( data ) {
                  errorResponse( data )
                  expect( server.activeGames[ key ].players[ 'naughtydog' ] ).to.be.undefined
               } )
            } )
         } )
      } )
   } )
} )

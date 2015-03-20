#!/usr/local/bin/node
var engine = require( '../engine.js' );
var net = require( 'net' );
var struct = require( 'struct' );
var server = require( '../server.js' );
var expect = require( 'chai' ).expect;

var port = 6969;
var client;

var header = struct()
   .word8( 'type' )

var newGame = struct()
   .struct( 'header', header )
   .word8( 'numPlayers' )
   .word8( 'numAchievements' )

function sendReq( client, done, tx ) {
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

   var msg = newGame
      .allocate()
   var proxy = msg.fields
   proxy.header.type = server.reqNewGame;
   proxy.numPlayers = numPlayers;
   proxy.numAchievements = numAchievements;
   sendReq( client, done, msg.buffer() );
}

function newClient() {
   return net.connect( port );
}

function startBasicGame( done ) {
   server.start( port );
   client = newClient();
   sendNewGameReq( client, function( data ) {
      done( data );
   } )
}

describe( 'New Server', function() {

   describe( 'NewGame', function() {
      var resp = struct()
         .word8( 'type' )
         .chars( 'key', server.keySize )
      describe( 'valid request', function() {
         before( function( done ) {
            startBasicGame( function( data ) {
               resp._setBuff( data );
               done();
            } )
         } )
         after( function() {
            server.kill();
         } )

         it( 'success response code', function() {
            expect( resp.get( 'type' ) ).to.equal( server.respSuccess );
         } )

         it( 'key has valid format', function() {
            var regexStr = '[' + server.keyChars + ']{' + server.keySize + '}';
            expect( resp.get( 'key' ) ).to.match( new RegExp( regexStr, 'i' ) )    
         } )
         it( 'server created game', function() {
            var gameRecord = server.activeGames[ resp.get( 'key' ) ];
            expect( gameRecord ).to.not.be.empty;
            expect( gameRecord.numPlayers ).to.equal( 2 );
         } )
      } )
   } )
   describe( 'bad request', function() {
      before( function( done ) {
         server.start( port );
         client = newClient();
         sendNewGameReq( client, function( data ) {
            header._setBuff( data );
            done(); }, 7 );
      } )
      after( function() {
         server.kill();
      } )

      it( 'err response code', function() {
         expect( header.get( 'type' ) ).to.equal( server.respError );
      } )
      it( 'no games created', function() {
         expect( Object.keys( server.activeGames ).length ).to.equal( 0 );
      } )
   } )
} )

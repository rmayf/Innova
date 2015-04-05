####Protocol Overview
The server uses a dual tcp connection protocol to interact with clients.
  One connection is used for transaction based requests.  A client sends a request message,
  the server sends back a response and kills the connection.  This is used for game creation, 
matchmaking, and requesting game state updates.
  The other connection is established once a client joins a game.  This connection remains active for the
  duration of the game.  The server will ping a client over this persistant connection when the game state 
has changed, signalling to the client to request an update.  This dual connection protocol has many benefits:
  * The client doesn't constantly pull the server for updates
  * The server can detect when a client disconnects
  * Transactions eliminate the concern of TCP framing for larger messages in streaming tcp protocols

###JSON Request Objects

#####Create Game
```javascript
{
   action: 'create'
   name: string
   players: int
   achievements: int
}
```

#####Join Game
```javascript
{
   action: 'join'
   name: string
   key: string
}
```



###Message Definitions
  all messages are expected to be big endian.  Strings are not null terminated.

#####Error Response
header  |error size      |error[ 0 ] | error[ 1 ] | ...
--------|----------------|------|-----|-------|
0x45|word8| char | char | ...

#####New Game Request
header| Number of Players | Number of Achievements
------|-------------------|-----------------------
0x6E | word8 | word8

#####New Game Response
header| key[ 0 ] | ... | key[ 15 ]
-----|-----------|-----|----------
0x53 | char | ... | char

#####Join Game Request
header| key[ 16 ] | nameSize | name[ 0 ] | ... | name[ nameSize - 1 ]
----|-------------|----------|-----------|-----|--------------------
0x6A| char[ 16 ] | word8 | char | ... | char

#####Join Game Response
header| key[ 16 ] | port 
-----|------------|------
0x53 | char[ 16 ] | U16

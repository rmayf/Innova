exports.InvalidMove = function( msg ) {
   this.name = "InvalidMove";
   this.message = msg;
};

exports.VictoryCondition = function( players, msg ) {
   this.name = "VictoryCondition";
   this.players = players;
   this.message = players[ 0 ].name;
   for( var i = 1; i < players.length; i++ ) {
      this.message += ', ' + players[ i ].name;
   }
   this.message += ': ' + msg;
};

exports.Reaction = function( n, list, callback ) {
   this.n = n;
   this.list = list;
   this.callback = callback; 
};

exports.Yellow = 0;
exports.Red = 1;
exports.Green = 2;
exports.Purple = 3;
exports.Blue = 4;

exports.Hex = 0;
exports.Leaf = 1;
exports.Factory = 2;
exports.Crown = 3;
exports.Clock = 4;
exports.Lightbulb = 5;   
exports.Castle = 6;

exports.None = 0;
exports.Left = 1;
exports.Right = 2;
exports.Up = 3;

exports.Draw = 0;
exports.Meld = 1;
exports.Achieve = 2;
exports.Dogma = 3;

exports.Monument = 0;
exports.Empire = 1;
exports.World = 2;
exports.Wonder = 3;
exports.Universe = 4;

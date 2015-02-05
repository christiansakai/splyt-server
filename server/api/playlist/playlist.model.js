'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  User = require('../user/user.model');

var PlaylistSchema = new Schema({
	title: {type: String, require: true },
	songs:[{ type: Schema.Types.ObjectId, ref: 'Song' }],
  friend_stream: { type: Boolean, default: false },
  aggregate_stream: {type: Boolean, default: false }
});

PlaylistSchema.statics.addNewSong = function(song, playlist, userid, cb) {
  var Playlist = this;

  Playlist.findByIdAndUpdate(playlist,
    { $push: { "songs" : song }},
    { safe: true, upsert: true },
    function( err, model ) {
      if ( playlist.aggregate_stream === false ) {
        User.findById(userid, function(err, user) {
          _.findWhere(user.playlists, {'aggregate_stream': true }, function(err, playlist) {
            Playlist.findByIdAndUpdate(playlist,
              { $push: {"songs" : song }},
              { safe: true, upsert: true },
              function(err, model) {
                cb(err, model);
              })
          })
        })
      } else {
      cb(err, model);
      }
    }
  );
}

module.exports = mongoose.model('Playlist', PlaylistSchema);

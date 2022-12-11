const mongoose = require('mongoose');

const playersNoSchema = {
  playerANo: { type: String, trim: true },
  playerBNo: { type: String, trim: true }
};

const playersSchema = {
  playerA: { type: String, trim: true },
  playerB: { type: String, trim: true }
};

const playersIdSchema = {
  playerAId: { type: String, trim: true },
  playerBId: { type: String, trim: true },
};

const winsSchema = {
  playerA: { type: Number },
  playerB: { type: Number },
};

const scoresSchema = {
  setScoresA: { type: [Number], trim: true },
  setScoresB: { type: [Number], trim: true }
};



const MatchRecordsSchema = {
  matchNumber: { type: Number, trim: true },
  roundNumber: { type: Number, trim: true },
  isBlank: { type: Boolean },
  roundName: { type: String, trim: true },
  status: { type: String, trim: true, enum: ['yetToPlay', 'completed', 'bye', 'walkover', 'cancel'] },
  status2: { type: String, trim: true },
  propogatePlayerID: { type: String, trim: true },
  propogatePlaceHolder: { type: String, trim: true },
  propogatePlayerName: { type: String, trim: true },
  getStatusColorB : { type:String},
  getStatusColorA : { type:String},
  players: { type: playersSchema, trim: true },
  playersID: { type: playersIdSchema, trim: true },
  playersNo : { type: playersNoSchema},
  setWins : { type:winsSchema},
  scores: { type: scoresSchema },
  completedscores : { type : [String]},
  winner : { type : String},
  winnerID: { type: String },
  winnerNo: { type: String },
  nextMatchNumber : { type: Number},
  nextSlot : { type:String}
};



MatchCollectionSchema = new mongoose.Schema({
  "tournamentId": { type: String },
  "eventName": { type: String, },
  "drawsLock": { type: Boolean },
  "matchRecords": { type: [MatchRecordsSchema], }
});

const MatchCollectionDB = mongoose.model('MatchCollectionDB', MatchCollectionSchema,"MatchCollectionDB");
module.exports = MatchCollectionDB;
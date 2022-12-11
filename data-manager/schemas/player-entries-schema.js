const mongoose = require('mongoose');

const playerEntriesSchema = new mongoose.Schema({
  playerId: { type: String  },
  academyId: { type: String  },
  associationId: { type: String },
  parentAssociationId: { type: String },
  tournamentId: { type: String },
  subscribedEvents: { type: [String] },
  totalFee: { type: String },
  paidOrNot: { type: Boolean },
  schoolId: { type: String },
})

const PlayerEntries = mongoose.model('playerEntries', playerEntriesSchema, 'playerEntries');
module.exports = PlayerEntries;

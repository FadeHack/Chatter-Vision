const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const meetingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    meetingUrl: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins that convert mongoose to json
meetingSchema.plugin(toJSON);
meetingSchema.plugin(paginate);

/**
 * Check if meeting URL is taken
 * @param {string} meetingUrl - The meeting URL
 * @returns {Promise<boolean>}
 */
meetingSchema.statics.isMeetingUrlTaken = async function (meetingUrl) {
  const meeting = await this.findOne({ meetingUrl });
  return !!meeting;
};

/**
 * Create a meeting
 * @param {Object} meetingBody
 * @returns {Promise<Meeting>}
 */
meetingSchema.statics.createMeeting = async function (meetingBody) {
  if (await this.isMeetingUrlTaken(meetingBody.meetingUrl)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meeting URL already taken');
  }
  return this.create(meetingBody);
};

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
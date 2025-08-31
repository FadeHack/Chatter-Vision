const httpStatus = require('http-status');
const { User, Meeting } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meeting
 * @param {Object} meetingBody
 * @returns {Promise<Meeting>}
 */
const createMeeting = async (meetingBody) => {
  return Meeting.createMeeting(meetingBody);
};

/**
 * Get meeting by URL
 * @param {string} meetingUrl
 * @returns {Promise<Meeting>}
 */
const getMeetingByUrl = async (meetingUrl) => {
  return Meeting.findOne({ meetingUrl, status: 'active' });
};

/**
 * End a meeting
 * @param {string} meetingId
 * @returns {Promise<Meeting>}
 */
const endMeeting = async (meetingId) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }
  meeting.status = 'ended';
  await meeting.save();
  return meeting;
};

module.exports = {
  createMeeting,
  getMeetingByUrl,
  endMeeting,
}; 
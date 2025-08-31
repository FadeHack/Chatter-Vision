const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { meetingService } = require('../services');

/**
 * Create a new meeting
 */
const createMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.createMeeting({
    ...req.body,
    host: req.user.id,
    meetingUrl: req.body.meetingUrl,
  });
  res.status(httpStatus.CREATED).send(meeting);
});

/**
 * Get meeting by URL
 */
const getMeeting = catchAsync(async (req, res) => {
  const meeting = await meetingService.getMeetingByUrl(req.params.meetingUrl);
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }
  res.send(meeting);
});

module.exports = {
  createMeeting,
  getMeeting,
};
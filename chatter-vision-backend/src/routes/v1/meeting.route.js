const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const meetingValidation = require('../../validations/meeting.validation');
const meetingController = require('../../controllers/meeting.controller');

const router = express.Router();

router.route('/').post(
  auth(),
  validate(meetingValidation.createMeeting),
  meetingController.createMeeting
);

router.route('/:meetingUrl').get(
  auth(),
  validate(meetingValidation.getMeeting),
  meetingController.getMeeting
);

module.exports = router; 
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMeeting = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    meetingUrl: Joi.string().required(),
  }),
};

const getMeeting = {
  params: Joi.object().keys({
    meetingId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMeeting,
  getMeeting,
};
const request = require('supertest');
const { app } = require('../../src/app');
const httpStatus = require('http-status');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { adminAccessToken } = require('../fixtures/token.fixture');

describe('Meeting routes', () => {
  describe('POST /v1/meetings', () => {
    let newMeeting;

    beforeEach(() => {
      newMeeting = {
        title: 'Team Sync',
        meetingUrl: 'team-sync-12345',
      };
    });

    test('should return 201 and successfully create a new meeting if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/meetings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newMeeting)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toMatchObject({
        title: newMeeting.title,
        host: admin._id.toHexString(),
        meetingUrl: newMeeting.meetingUrl,
        status: 'active',
      });

      const dbMeeting = await Meeting.findById(res.body.id);
      expect(dbMeeting).toBeDefined();
      expect(dbMeeting.title).toBe(newMeeting.title);
    });

    test('should return 400 error if meeting URL is already taken', async () => {
      await insertUsers([admin]);
      await Meeting.createMeeting({ ...newMeeting, host: admin._id });

      const res = await request(app)
        .post('/v1/meetings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newMeeting)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body.message).toBe('Meeting URL already taken');
    });
  });

  describe('GET /v1/meetings/:meetingUrl', () => {
    let meeting;
    beforeEach(async () => {
      meeting = await Meeting.createMeeting({
        title: 'Project Review',
        host: admin._id,
        meetingUrl: 'project-review-67890',
      });
    });

    test('should return 200 and the meeting object if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .get(`/v1/meetings/${meeting.meetingUrl}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        id: meeting._id.toHexString(),
        title: meeting.title,
        host: admin._id.toHexString(),
        meetingUrl: meeting.meetingUrl,
        status: 'active',
      });
    });

    test('should return 404 if meeting does not exist', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .get('/v1/meetings/non-existent-url')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);

      expect(res.body.message).toBe('Meeting not found');
    });
  });
}); 
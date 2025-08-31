import axios from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/constants";

class MeetingsService {
  async createMeeting(title, meetingUrl) {
    const response = await axios.post(API_ENDPOINTS.MEETING.CREATE, { title, meetingUrl });
    return response.data;
  }
}

export default new MeetingsService();
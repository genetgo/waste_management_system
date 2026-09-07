import API from "./api"; 

const scheduleService = {

  async getMySchedule() {
    const response = await API.get("/schedules/my-schedule");
    return response.data;
  },

  
  async getSchedules(kebele) {
    const response = await API.get("/schedules", {
      params: { kebele },
    });
    return response.data;
  },

  
  async createSchedule(scheduleData) {
    const response = await API.post(
      "/schedules",
      scheduleData
    );
    return response.data;
  },

  
  async updateSchedule(id, scheduleData) {
    const response = await API.put(
      `/schedules/${id}`,
      scheduleData
    );
    return response.data;
  }
};

export default scheduleService;
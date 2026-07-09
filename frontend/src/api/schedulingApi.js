import api from "./axiosConfig";

export const getScheduleDashboard = () =>
  api.get("/production-scheduling/dashboard");

export const getScheduleTimeline = () =>
  api.get("/production-scheduling/timeline/enhanced");

export const getScheduleTimelineBasic = () =>
  api.get("/production-scheduling/timeline");

export const getScheduleCalendar = () =>
  api.get("/production-scheduling/calendar");

export const getScheduleShifts = () =>
  api.get("/production-scheduling/shifts");

export const getScheduleLiveMachines = () =>
  api.get("/production-scheduling/live-machines");

export const getScheduleQueue = () =>
  api.get("/production-scheduling/queue");

export const getScheduleMaterials = () =>
  api.get("/production-scheduling/materials");

export const getScheduleConflicts = () =>
  api.get("/production-scheduling/conflicts");

export const getScheduleBottomKpis = () =>
  api.get("/production-scheduling/bottom-kpis");

export const getMachineAllocation = () =>
  api.get("/production-scheduling/machine-allocation");

export const rescheduleWorkOrder = (payload) =>
  api.post("/production-scheduling/reschedule", payload);

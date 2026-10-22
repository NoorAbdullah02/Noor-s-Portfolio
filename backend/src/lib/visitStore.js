import { hasDatabase } from "./db.js";
import * as json from "./jsonVisitStore.js";
import * as pg from "./pgVisitStore.js";

const impl = () => (hasDatabase() ? pg : json);

export const cleanVisitorId = (value) => {
  const id = String(value ?? "");
  return /^[a-z0-9-]{8,64}$/i.test(id) ? id : "";
};

export const addVisit = async (entry) => impl().addVisit(entry);
export const getVisit = async (id) => impl().getVisit(id);
export const updateVisit = async (id, changes) => impl().updateVisit(id, changes);
export const countVisits = async (visitorId) => impl().countVisits(visitorId);
export const getVisits = async (options) => impl().getVisits(options);
export const getStats = async () => impl().getStats();

import { hasDatabase } from "./db.js";
import * as json from "./jsonMessageStore.js";
import * as pg from "./pgMessageStore.js";

const impl = () => (hasDatabase() ? pg : json);

export const addMessage = async (entry) => impl().addMessage(entry);
export const getMessages = async () => impl().getMessages();
export const getMessage = async (id) => impl().getMessage(id);
export const setRead = async (id, read) => impl().setRead(id, read);
export const addReply = async (id, body) => impl().addReply(id, body);
export const deleteMessage = async (id) => impl().deleteMessage(id);
export const knownVisitors = async () => impl().knownVisitors();
export const findKnownVisitor = async (visitorId) => impl().findKnownVisitor(visitorId);
export const getMessageStats = async () => impl().getMessageStats();

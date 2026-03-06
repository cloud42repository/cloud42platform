import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  CliqChannel, CreateChannelDTO,
  CliqMessage, SendCliqMessageDTO,
  CliqUserGroup, CreateUserGroupDTO,
  CliqBot,
  CliqListParams,
} from "./zoho-cliq.dto";

export interface ZohoCliqConfig extends ZohoCredentials {
  /** Override the full API base URL. Defaults to https://cliq.zoho.com/api/v2 */
  apiBaseUrl?: string;
}

/**
 * Zoho Cliq v2 API client.
 * Docs: https://www.zoho.com/cliq/help/restapi/v2/
 */
export class ZohoCliqClient extends ZohoBaseClient {
  constructor(config: ZohoCliqConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://cliq.zoho.com/api/v2",
    });
  }

  // â”€â”€â”€ Channels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listChannels(params?: CliqListParams): Promise<{ channels: CliqChannel[] }> {
    return this.get("/channels", { params });
  }
  getChannel(uniqueName: string): Promise<{ channel: CliqChannel }> {
    return this.get(`/channels/${uniqueName}`);
  }
  createChannel(data: CreateChannelDTO): Promise<{ channel: CliqChannel }> {
    return this.post("/channels", data);
  }
  deleteChannel(uniqueName: string): Promise<unknown> {
    return this.delete(`/channels/${uniqueName}`);
  }
  addChannelMember(uniqueName: string, emails: string[]): Promise<unknown> {
    return this.post(`/channels/${uniqueName}/members`, { email_ids: emails });
  }
  removeChannelMember(uniqueName: string, email: string): Promise<unknown> {
    return this.delete(`/channels/${uniqueName}/members`, { data: { email_ids: [email] } });
  }

  // â”€â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listChannelMessages(uniqueName: string): Promise<{ messages: CliqMessage[] }> {
    return this.get(`/channels/${uniqueName}/messages`);
  }
  sendChannelMessage(uniqueName: string, data: SendCliqMessageDTO): Promise<{ message: CliqMessage }> {
    return this.post(`/channels/${uniqueName}/message`, data);
  }
  sendDirectMessage(email: string, data: SendCliqMessageDTO): Promise<{ message: CliqMessage }> {
    return this.post(`/buddies/${email}/message`, data);
  }
  deleteMessage(channelUniqueName: string, messageId: string): Promise<unknown> {
    return this.delete(`/channels/${channelUniqueName}/messages/${messageId}`);
  }

  // â”€â”€â”€ User Groups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listUserGroups(): Promise<{ usergroups: CliqUserGroup[] }> {
    return this.get("/usergroups");
  }
  getUserGroup(uniqueName: string): Promise<{ usergroup: CliqUserGroup }> {
    return this.get(`/usergroups/${uniqueName}`);
  }
  createUserGroup(data: CreateUserGroupDTO): Promise<{ usergroup: CliqUserGroup }> {
    return this.post("/usergroups", data);
  }

  // â”€â”€â”€ Bots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listBots(): Promise<{ bots: CliqBot[] }> {
    return this.get("/bots");
  }
  sendBotMessage(botUniqueName: string, data: SendCliqMessageDTO): Promise<{ message: CliqMessage }> {
    return this.post(`/bots/${botUniqueName}/message`, data);
  }
}

import * as signalR from "@microsoft/signalr"
import { hubUrl } from "@/lib/api-origin"

export default class ChatService {
  private connection: signalR.HubConnection

  constructor(token: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()
  }

  async start() {
    try {
      await this.connection.start()
    } catch (err) {
    }
  }

  async stop() {
    await this.connection.stop()
  }

  joinConversation(conversationId: string) {
    this.connection.invoke("JoinConversation", conversationId)
  }

  leaveConversation(conversationId: string) {
    this.connection.invoke("LeaveConversation", conversationId)
  }

  sendMessage(conversationId: string, content: string) {
    this.connection.invoke("SendMessage", conversationId, content)
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.connection.on("ReceiveMessage", callback)
  }

  onUserJoined(callback: (user: any) => void) {
    this.connection.on("UserJoined", callback)
  }

  onUserLeft(callback: (user: any) => void) {
    this.connection.on("UserLeft", callback)
  }
}

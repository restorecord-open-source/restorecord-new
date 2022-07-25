import MJ from "node-mailjet";
import Client from "node-mailjet/declarations/client/index"

export const Email: Client = new MJ({ apiKey: process.env.MAILJET_API_KEY, apiSecret: process.env.MAILJET_API_SECRET });
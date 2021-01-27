import { Context as BaseContext, Request as BaseRequest } from "koa";

export interface Request extends BaseRequest {
  body: Promise<any>;
}

export interface Context extends BaseContext {
  params: { [key: string]: string };
  request: Request;
}

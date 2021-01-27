import { Middleware } from "koa";

export interface Config {
  /**
   * 端口号,默认7001
   */
  port?: number;

  /**
   * 是否启用,默认true
   */
  enable?: boolean;

  /**
   * 中间件,默认[]
   */
  middleware?: Middleware[];
}

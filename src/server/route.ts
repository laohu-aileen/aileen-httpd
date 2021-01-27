import { Context } from "../interface";

export class Route {
  /**
   * 处理函数
   */
  protected action: Function;

  /**
   * 绑定处理器
   * @param action
   */
  public to(action: Function) {
    this.action = action;
    return this;
  }

  /**
   * 执行操作
   * @param ctx
   * @param params
   */
  public async exec(ctx: Context, params: { [key: string]: string }) {
    ctx.params = params;
    return await this.action(ctx);
  }
}

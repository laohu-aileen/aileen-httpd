import Trouter, { HTTPMethod } from "trouter";
import { Route } from "./route";
import compose from "koa-compose";
import { Context } from "../interface";
import { boolean as toBoolean } from "boolean";
import { join } from "path";
import {
  HttpAnnotation,
  ControllerAnnotation,
  RequiredAnnotation,
} from "../annotation/controller";
import { ContextAnnotation } from "../annotation/parameter";
import { MiddlewareAnnotation } from "../annotation/middleware";
import { ResponseAnnotation } from "../annotation/response";
import { RouterBean } from "../injector";
import { BadRequestError } from "./error";
import { RouteNoFoundExceptionHandlerAnnotation } from "../annotation/controller";

/**
 * 类型转换器
 * @param type
 */
const createConverter = (type: any) => {
  switch (type) {
    case String: {
      return String;
    }
    case Number: {
      return Number;
    }
    case Date: {
      return (v: string) => {
        const t = Number(v);
        return new Date(t * 1000);
      };
    }
    case Boolean: {
      return toBoolean;
    }
    default: {
      return (v: any) => v;
    }
  }
};

/**
 * 路由对象
 */
@RouterBean.Component
export class Router {
  /**
   * 解析引擎
   */
  protected engine = new Trouter<Route>();

  /**
   * 路由不存在处理
   */
  protected routeNoFoundHandle: (ctx: Context) => any;

  /**
   * 绑定路由
   * @param method
   * @param path
   */
  public bind(method: HTTPMethod, path: string) {
    const route = new Route();
    this.engine.add(method, path, route);
    return route;
  }

  /**
   * 处理异常注册
   * @param target
   */
  protected parseAdvice(target: object) {
    const method = RouteNoFoundExceptionHandlerAnnotation.getRefMethods(
      target
    ).pop();
    if (method) {
      this.routeNoFoundHandle = target[method.key].bind(target);
    }
  }

  /**
   * 注册控制器
   * @param Object
   */
  public register(target: Object): void {
    if (!ControllerAnnotation.hasRef(target)) return;
    const { basePath, advice } = ControllerAnnotation.getRef(target);
    if (advice) return this.parseAdvice(target);
    const methods = HttpAnnotation.getRefMethods(target);

    // 公共中间件
    const baseMiddlewares = (MiddlewareAnnotation.getRefs(target) || []).map(
      (ref) => ref.handler
    );

    for (const { key, parameters } of methods) {
      // 方法中间件
      const routeMiddlewares = (
        MiddlewareAnnotation.getRefs(target, key) || []
      ).map((ref) => ref.handler);

      // 生成参数解析器
      const paramsHandlers = parameters.map((type, index) => {
        const { handler } = ContextAnnotation.getRef(target, key, index);
        const converter = createConverter(type);
        const reqRef = RequiredAnnotation.getRef(target, key, index);
        return async (ctx: Context) => {
          const res = await handler(ctx);
          if (res !== undefined) return converter(res);
          if (!reqRef) return undefined;
          if (!reqRef.value) return undefined;
          if (reqRef.default !== undefined) return reqRef.default;
          throw new BadRequestError("参数缺失");
        };
      });

      // 响应处理器
      const responseRef = ResponseAnnotation.getRef(target, key);
      const responseHandler = async (ctx: Context, res: any) => {
        ctx.status = responseRef?.status || 200;
        ctx.body = res;
      };

      // 生成处理器
      const action = async (ctx: Context) => {
        const params = await Promise.all(
          paramsHandlers.map((handle) => handle(ctx))
        );
        const res = await target[key](...params);
        await responseHandler(ctx, res);
      };

      // 合并中间件
      const handler = compose([
        ...baseMiddlewares,
        ...routeMiddlewares,
        action,
      ]);

      // 挂载路由
      const refs = HttpAnnotation.getRefs(target, key);
      for (const ref of refs) {
        const path = join(basePath, ref.path);
        this.bind(ref.method, path).to(handler);
      }
    }
  }

  /**
   * 处理请求
   * @param ctx
   */
  public async handler(ctx: Context) {
    const { handlers, params } = this.engine.find(<any>ctx.method, ctx.path);
    if (handlers.length) return await handlers[0].exec(ctx, params);
    if (this.routeNoFoundHandle) await this.routeNoFoundHandle(ctx);
  }
}

import { Annotation } from "aileen-annotation";
import { Middleware as MiddleHandler } from "koa";

/**
 * 路由注解
 */
export const MiddlewareAnnotation = new Annotation<{
  handler: MiddleHandler;
}>();

/**
 * 路由注解
 * @param id
 */
export const Middleware = (
  handler: MiddleHandler
): MethodDecorator & ClassDecorator =>
  MiddlewareAnnotation.decorator({ handler });

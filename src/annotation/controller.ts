import { Annotation } from "aileen-annotation";
import { HTTPMethod } from "trouter";
import { ComponentAnnotation } from "aileen-core";

/**
 * 控制器组件ID
 */
export const ControllerComponentID = Symbol("ControllerComponentID");

/**
 * 控制器选项
 */
export interface ControllerOption {
  basePath?: string;
  advice?: boolean;
}

/**
 * 控制器注解
 */
export const ControllerAnnotation = new Annotation<ControllerOption>();
ControllerAnnotation.warp(() =>
  ComponentAnnotation.decorator({
    scope: "singleton",
    lazy: false,
    tags: [ControllerComponentID],
  })
);

/**
 * 控制器解析注解
 * @param id
 */
export const Controller = (
  options: {
    basePath?: string;
  } = {}
): ClassDecorator =>
  ControllerAnnotation.decorator({
    basePath: options.basePath || "/",
    advice: false,
  });

/**
 * 控制器建议
 */
export const ControllerAdvice = (): ClassDecorator =>
  ControllerAnnotation.decorator({
    advice: true,
  });

/**
 * 路由存在处理注解
 */
export const RouteNoFoundExceptionHandlerAnnotation = new Annotation();

/**
 * 路由存在处理注解
 */
export const RouteNoFoundExceptionHandler = (): MethodDecorator =>
  RouteNoFoundExceptionHandlerAnnotation.decorator({});

/**
 * 路由选项
 */
export interface HttpOption {
  method: HTTPMethod;
  path: string;
}

/**
 * 路由注解
 */
export const HttpAnnotation = new Annotation<HttpOption>();

/**
 * 路由注解
 * @param id
 */
export const HTTP = (method: HTTPMethod, path: string): MethodDecorator =>
  HttpAnnotation.decorator({ method, path });

/**
 * 路由包装注解
 * @param path
 */
export const GET = (path: string = "") => HTTP("GET", path);
export const POST = (path: string = "") => HTTP("POST", path);
export const PUT = (path: string = "") => HTTP("PUT", path);
export const PATCH = (path: string = "") => HTTP("PATCH", path);
export const DELETE = (path: string = "") => HTTP("DELETE", path);

/**
 * 必填注解
 */
export const RequiredAnnotation = new Annotation<{
  value: boolean;
  default: any;
}>();

/**
 * 必填注解
 * @param id
 */
export const Required = (
  value: boolean,
  def?: any
): MethodDecorator & ParameterDecorator =>
  RequiredAnnotation.decorator({
    value,
    default: def,
  });

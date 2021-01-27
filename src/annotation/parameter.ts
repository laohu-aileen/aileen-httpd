import { Annotation } from "aileen-annotation";
import bodyParse from "co-body";
import { Context } from "../interface";

/**
 * 上下文注解
 */
export const ContextAnnotation = new Annotation<{
  handler: (ctx: Context) => any;
}>();

/**
 * 获取原始上下文
 */
export const OriginContext = (): ParameterDecorator =>
  ContextAnnotation.decorator({ handler: (ctx) => ctx });

/**
 * 获取原始请求对象
 */
export const OriginRequest = (): ParameterDecorator =>
  ContextAnnotation.decorator({ handler: (ctx) => ctx.request });

/**
 * 获取原始响应对象
 */
export const OriginResponse = (): ParameterDecorator =>
  ContextAnnotation.decorator({ handler: (ctx) => ctx.response });

/**
 * PATH注解
 */
export const PathAnnotation = new Annotation<{
  name: string;
}>();
PathAnnotation.warp(({ name }) =>
  ContextAnnotation.decorator({
    handler: (ctx) => ctx.params[name],
  })
);

/**
 * 请求PATH参数解析
 * @param name
 */
export const PathVariable = (name: string): ParameterDecorator =>
  PathAnnotation.decorator({ name });

/**
 * QUERY注解
 */
export const QueryAnnotation = new Annotation<{
  name?: string;
}>();
QueryAnnotation.warp(({ name }) =>
  ContextAnnotation.decorator({
    handler: (ctx) => (name ? ctx.request.query[name] : ctx.request.query),
  })
);

/**
 * 请求Query参数解析
 * @param name
 */
export const RequestQurey = (name: string): ParameterDecorator =>
  QueryAnnotation.decorator({ name });

/**
 * QUERY注解
 */
export const HeaderAnnotation = new Annotation<{
  name?: string;
}>();
HeaderAnnotation.warp(({ name }) =>
  ContextAnnotation.decorator({
    handler: (ctx) => (name ? ctx.request.header[name] : ctx.request.header),
  })
);

/**
 * 请求Header参数解析
 * @param name
 */
export const RequestHeader = (name?: string): ParameterDecorator =>
  HeaderAnnotation.decorator({ name });

/**
 * QUERY注解
 */
export const BodyAnnotation = new Annotation<{
  name?: string;
}>();
BodyAnnotation.warp(({ name }) =>
  ContextAnnotation.decorator({
    handler: async (ctx) => {
      if (!ctx.request.body) ctx.request.body = bodyParse(ctx.req);
      const body = await ctx.request.body;
      return name ? body[name] : body;
    },
  })
);

/**
 * 请求Body参数注解
 * @param name
 */
export const RequestBody = (name?: string): ParameterDecorator =>
  BodyAnnotation.decorator({ name });

import { Annotation } from "aileen-annotation";

/**
 * 响应注解
 */
export const ResponseAnnotation = new Annotation<{
  status?: number;
}>();

/**
 * 响应状态
 */
export const ResponseStatus = (status: number): MethodDecorator =>
  ResponseAnnotation.decorator({ status });

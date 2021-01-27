import Koa from "koa";
import { Config } from "./config";
import {
  Logger,
  declareRegister,
  declareBooter,
  LoggerBean,
} from "aileen-core";
import { ControllerComponentID } from "./annotation/controller";
import { Router } from "./server/router";
import { ConfigBean, RouterBean } from "./injector";

/**
 * 启动服务
 */
const start = (app: Koa, port: number) =>
  new Promise<void>((resolve) => {
    app.listen(port, resolve);
  });

/**
 * 声明启动器
 */
export const register = declareRegister(async (app, next) => {
  // 注册组件
  app.bind(Koa).toConstructor(Koa);

  // 执行应用启动
  await next();
});

export const booter = declareBooter(async (app, next) => {
  await next();

  // 插件未配置
  if (!app.has(ConfigBean.ID)) return;

  // 服务不启动
  const config = app.get<Config>(ConfigBean.ID);
  if (!config.enable) return;

  // 获取依赖
  const router = app.get<Router>(RouterBean.ID);
  const logger = app.get<Logger>(LoggerBean.ID);

  // 配置服务
  const server = app.get<Koa>(Koa);
  const port = config.port || 7001;

  // 注册控制器
  const controllers = app.getAllByTag(ControllerComponentID);
  for (const controller of controllers) {
    router.register(controller);
  }

  // 启动服务
  server.use(router.handler.bind(router));
  await start(server, port);
  logger.info("HTTPD服务启动成功, 监听端口", port);
});

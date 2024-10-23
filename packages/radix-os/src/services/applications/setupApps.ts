import { defaultApps } from "../../defaultApps";
import {
  RadixOsApp,
  RadixOsAppComponent,
} from "../../stores/window";

export type RadixAppList<T extends string> =
  readonly RadixOsApp<T>[];

export type DefaultApps =
  | "explorer"
  | "terminal"
  | "web"
  | "settings"
  | "code";

export const createApp = (
  arg: RadixOsAppComponent
): RadixOsAppComponent => arg;

export const setupApps = <
  TProvided extends string,
  TActual extends string = string extends TProvided
    ? DefaultApps
    : TProvided | DefaultApps
>(
  apps: RadixAppList<TProvided>,
  options?: {
    defaultAppsOnDesktop?: DefaultApps[];
  }
): RadixAppList<TActual> => {
  const applications = Object.values(
    [
      ...defaultApps.map((app) => ({
        ...app,
        addToDesktop: options?.defaultAppsOnDesktop
          ? options.defaultAppsOnDesktop.includes(
              app.appId as "explorer"
            )
          : app.addToDesktop,
      })),
      ...(apps ?? []),
    ].reduce((acc, item) => {
      acc[item.appId] = item as RadixAppList<TActual>[number];
      return acc;
    }, {} as Record<string, RadixAppList<TActual>[number]>)
  ) as unknown as RadixAppList<TActual>;

  return applications;
};

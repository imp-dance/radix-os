import { ComponentProps } from "react";
import {
  Terminal,
  TerminalPlugin,
} from "../../components/apps/Terminal/Terminal";
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

export type SetupAppsOptions = {
  defaultAppsOnDesktop?: DefaultApps[];
  terminalPlugins?: TerminalPlugin[];
};

export const createApp = (
  arg: RadixOsAppComponent
): RadixOsAppComponent => arg;

/** Injects relevant props to default apps based on options */
function defaultAppMapper(
  application: (typeof defaultApps)[number],
  options?: SetupAppsOptions
) {
  let component = application.component;
  switch (application.appId) {
    case "terminal":
      if (options?.terminalPlugins) {
        component = (props: ComponentProps<typeof Terminal>) => {
          return (
            <Terminal
              {...props}
              plugins={options?.terminalPlugins}
            />
          );
        };
      }
      break;
    default:
      break;
  }
  return {
    ...application,
    addToDesktop: options?.defaultAppsOnDesktop
      ? options.defaultAppsOnDesktop.includes(
          application.appId as "explorer"
        )
      : application.addToDesktop,
    component,
  };
}

export const setupApps = <
  TProvided extends string,
  TActual extends string = string extends TProvided
    ? DefaultApps
    : TProvided | DefaultApps
>(
  apps: RadixAppList<TProvided>,
  options?: SetupAppsOptions
): RadixAppList<TActual> => {
  const applications = Object.values(
    [
      ...defaultApps.map((app) =>
        defaultAppMapper(app, options)
      ),
      ...(apps ?? []),
    ].reduce((acc, item) => {
      acc[item.appId] = item as RadixAppList<TActual>[number];
      return acc;
    }, {} as Record<string, RadixAppList<TActual>[number]>)
  ) as unknown as RadixAppList<TActual>;

  return applications;
};

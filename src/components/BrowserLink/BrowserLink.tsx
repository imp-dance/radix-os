import { Link } from "@radix-ui/themes";
import { useWindowStore } from "../../stores/window";
import { createWebBrowserWindow } from "../apps/WebBrowser/WebBrowser.window";

type Props = Parameters<typeof Link>[0];

export function BrowserLink(props: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        useWindowStore
          .getState()
          .addWindow(createWebBrowserWindow(props.href));
      }}
    >
      {props.children}
    </Link>
  );
}

import { Link } from "@radix-ui/themes";
import { useUntypedAppContext } from "../../integration/setupApps";
import { useWindowStore } from "../../stores/window";

type Props = Parameters<typeof Link>[0];

export function BrowserLink(props: Props) {
  const { openFile } = useUntypedAppContext();
  return (
    <Link
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const href = props.href ?? "";
        openFile({
          file: {
            data: href,
            launcher: ["web"],
            name: href,
            title: href,
          },
          path: href,
        });
        useWindowStore;
      }}
    >
      {props.children}
    </Link>
  );
}

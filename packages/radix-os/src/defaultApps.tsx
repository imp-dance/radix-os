import {
  CardStackIcon,
  CodeIcon,
  FileTextIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
  ImageIcon,
  SpeakerLoudIcon,
  VideoIcon,
} from "@radix-ui/react-icons";
import { AudioPlayer } from "./components/apps/AudioPlayer/AudioPlayer";
import { CodeApp } from "./components/apps/Code/Code";
import { ExplorerApp } from "./components/apps/Explorer/Explorer";
import { ImageViewer } from "./components/apps/ImageViewer/ImageViewer";
import { PDFViewer } from "./components/apps/PDFViewer/PDFViewer";
import { Settings } from "./components/apps/Settings/Settings";
import { Terminal } from "./components/apps/Terminal/Terminal";
import { VideoPlayer } from "./components/apps/VideoPlayer/VideoPlayer";
import { WebBrowser } from "./components/apps/WebBrowser/WebBrowser";

export const defaultApps = [
  {
    component: ExplorerApp,
    appId: "explorer",
    appName: "Explorer",
    addToDesktop: true,
    defaultWindowSettings: {
      title: "Explorer",
      icon: <HomeIcon />,
      initialHeight: 400,
      initialWidth: 600,
    },
  },
  {
    component: Settings,
    appId: "settings",
    appName: "Settings",
    addToDesktop: true,
    defaultWindowSettings: {
      unique: true,
      initialHeight: 358,
      initialWidth: 459,
      maxHeight: 358,
      maxWidth: 459,
      resizeable: false,
      icon: <GearIcon />,
      title: "Settings",
    },
  },
  {
    component: Terminal,
    appId: "terminal",
    appName: "Terminal",
    addToDesktop: true,
    defaultWindowSettings: {
      title: "Terminal",
      icon: <CardStackIcon />,
      initialHeight: 350,
      initialWidth: 515,
      scrollable: false,
    },
  },
  {
    component: CodeApp,
    appId: "code",
    appName: "Code",
    addToDesktop: true,
    defaultWindowSettings: {
      title: "New file",
      icon: <CodeIcon />,
      initialHeight: 600,
      initialWidth: 800,
    },
  },
  {
    component: WebBrowser,
    appId: "web",
    appName: "Web Browser",
    addToDesktop: true,
    defaultWindowSettings: {
      title: "Web Browser",
      icon: <GlobeIcon />,
      initialHeight: 600,
      initialWidth: 800,
    },
  },
  {
    component: ImageViewer,
    appId: "image",
    appName: "Image Viewer",
    addToDesktop: false,
    defaultWindowSettings: {
      title: "Image Viewer",
      icon: <ImageIcon />,
      initialHeight: 600,
      initialWidth: 800,
    },
  },
  {
    component: AudioPlayer,
    appId: "audio",
    appName: "Audio Player",
    addToDesktop: false,
    defaultWindowSettings: {
      title: "Audio Player",
      icon: <SpeakerLoudIcon />,
      initialHeight: 250,
      initialWidth: 500,
      minWidth: 300,
      scrollable: false,
      maxHeight: 250,
    },
  },
  {
    component: VideoPlayer,
    appId: "video",
    appName: "Video Player",
    addToDesktop: false,
    defaultWindowSettings: {
      title: "Video Player",
      icon: <VideoIcon />,
      initialHeight: 500,
      initialWidth: 500,
      minWidth: 300,
    },
  },
  {
    component: PDFViewer,
    appId: "pdf",
    appName: "PDF Viewer",
    addToDesktop: false,
    defaultWindowSettings: {
      title: "PDF Viewer",
      icon: <FileTextIcon />,
      initialHeight: 600,
      initialWidth: 500,
      minWidth: 300,
    },
  },
] as const;

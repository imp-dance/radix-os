import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const FS_FAV_LS_KEY = "fs_fav";

export const launcherSchema = z.enum([
  "code",
  "web",
  "terminal",
  "image",
]);

export type Launcher = z.infer<typeof launcherSchema>;

export type FileSystemStore = {
  addFolderToFavourites: (path: string) => void;
  removeFolderFromFavourites: (path: string) => void;
  favouriteFolders: string[];
  setFavourites: (favourites: string[]) => void;
};

export const useFavouriteFolderStore = create(
  persist<FileSystemStore>(
    (set) => ({
      favouriteFolders: [
        "Home",
        "Home/Documents",
        "Home/Images",
      ],
      setFavourites: (fav) =>
        set((s) => ({ ...s, favouriteFolders: fav })),
      addFolderToFavourites: (path) =>
        set((state) => {
          if (!state.favouriteFolders.includes(path)) {
            return {
              ...state,
              favouriteFolders: [
                ...state.favouriteFolders,
                path,
              ],
            };
          }
          return state;
        }),
      removeFolderFromFavourites: (path) =>
        set((state) => {
          return {
            ...state,
            favouriteFolders: state.favouriteFolders.filter(
              (f) => f !== path
            ),
          };
        }),
    }),
    {
      name: FS_FAV_LS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          favouriteFolders: state.favouriteFolders,
        } as FileSystemStore),
    }
  )
);

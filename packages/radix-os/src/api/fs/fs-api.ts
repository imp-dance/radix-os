import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useFs } from "../../services/fs/fs-integration";
import { useFavouriteFolderStore } from "../../stores/explorer";
import { FsFile } from "../../stores/fs";

export const useFileSystemQuery = (path: string) => {
  const fs = useFs();
  return useQuery({
    queryFn: () => fs.readDir(path),
    queryKey: ["fs", path],
  });
};

export const useUpdateFileMutation = (opts?: {
  onSuccess?: (data: boolean) => void;
}) => {
  const fs = useFs();
  const queryClient = useQueryClient();
  const favouritesStore = useFavouriteFolderStore();
  return useMutation({
    mutationFn: (args: {
      path: string;
      file: Partial<FsFile>;
    }) => fs.updateFile(args.path, args.file),
    onSuccess: (result, { path, file: { name } }) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("fs");
        },
      });
      opts?.onSuccess?.(result);
      // update favourites if renamed
      if (
        result === true &&
        name &&
        favouritesStore.favouriteFolders.find((p) => p === path)
      ) {
        const newPath = path.split("/");
        newPath.pop();
        newPath.push(name);
        favouritesStore.addFolderToFavourites(newPath.join("/"));
        favouritesStore.removeFolderFromFavourites(path);
      }
    },
  });
};

export const useRemoveFileMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => fs.removeFile(path),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fs"] }),
  });
};

export const useCreateFileMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      path: string;
      file: { name: string } & Partial<FsFile>;
    }) => fs.makeFile(args.path, args.file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("fs");
        },
      });
    },
  });
};

export const useCreateDirMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (path: string) => {
      const res = await fs.makeDir(path);
      await new Promise((res) => setTimeout(res, 2000));
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("fs");
        },
      });
    },
  });
};

export const useMoveMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { fromPath: string; toPath: string }) =>
      fs.move(args.fromPath, args.toPath),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("fs");
        },
      });
    },
  });
};

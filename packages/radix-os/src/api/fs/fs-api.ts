import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useFs } from "../../services/fs/fs-integration";
import { FsFile } from "../../stores/fs";

export const useFileSystemQuery = (path: string) => {
  const fs = useFs();
  return useQuery({
    queryFn: () => fs.readDir(path),
    queryKey: ["fs", path],
  });
};

export const useUpdateFileMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      path: string;
      file: Partial<FsFile>;
    }) => fs.updateFile(args.path, args.file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fs"] }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fs"] }),
  });
};

export const useCreateDirMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => fs.makeDir(path),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fs"] }),
  });
};

export const useMoveMutation = () => {
  const fs = useFs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { fromPath: string; toPath: string }) =>
      fs.move(args.fromPath, args.toPath),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fs"] }),
  });
};

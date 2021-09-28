/**
 * @description Rotas das pastas
 * @author @GuilhermeSantos001
 * @update 10/09/2021
 * @version 1.0.0
 */

import FolderController from "@/controllers/folders";

module.exports = {
  Query: {
    folderGet: async (parent: any, args: { filter: any, skip: number, limit: number }, context: { req: any }) => {
      try {
        const folders = FolderController.get(args.filter || {}, args.skip || 0, args.limit || 0);

        return folders;
      } catch (error: any) {
        throw new Error(error);
      }
    }
  }
}
/**
 * @description Rotas das pastas
 * @author @GuilhermeSantos001
 * @update 28/09/2021
 */

import { FolderStatus } from "@/app/mongo/folders-manager-mongo";
import FolderController from "@/controllers/folders";

interface FolderFilter {
  cid: string
  authorId: string
  name: string
  description: string
  status: FolderStatus
  type: string
  tag: string
}

module.exports = {
  Query: {
    folderGet: async (parent: unknown, args: { filter: FolderFilter, skip: number, limit: number }) => {
      try {
        const folders = FolderController.get({
          cid: args.filter.cid,
          authorId: args.filter.authorId,
          name: args.filter.name,
          description: args.filter.description,
          status: args.filter.status,
          type: args.filter.type,
          tag: args.filter.tag
        }, args.skip || 0, args.limit || 0);

        return folders;
      } catch (error) {
        throw new Error(String(error));
      }
    }
  }
}
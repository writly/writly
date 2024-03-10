import { CollaborationPlugin as LexicalCollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useState } from "react";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { WebsocketProvider } from "y-websocket";
import { Doc } from "yjs";

const randomUsername = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    length: 2,
    style: "capital",
  });

export const CollaborationPlugin = ({ id }: { id: string }) => {
  const [username] = useState(randomUsername());

  return (
    <LexicalCollaborationPlugin
      // @ts-ignore
      id={id}
      // @ts-ignore
      providerFactory={(_id, yjsDocMap) => {
        const doc = new Doc();
        yjsDocMap.set(_id, doc);
        return new WebsocketProvider(
          `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}/w`,
          _id,
          doc
        );
      }}
      initialEditorState={null}
      shouldBootstrap={true}
      username={username}
    />
  );
};

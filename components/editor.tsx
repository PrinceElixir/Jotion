"use client";

import { useTheme } from "next-themes";
import {
  BlockNoteEditor,
  PartialBlock,
  Block
} from "@blocknote/core";
import {
  BlockNoteView,
  useBlockNote,
  ReactSlashMenuItem,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import "@blocknote/core/style.css";

import { useEdgeStore } from "@/lib/edgestore";
import { HiOutlineGlobeAlt } from "react-icons/hi";

const cycleBlocksShortcut = (event: KeyboardEvent, editor: BlockNoteEditor) => {
  // Checks for Ctrl+G shortcut
  if (event.ctrlKey && event.key === "g") {
    // Needs type cast as Object.keys doesn't preserve type
    const allBlockTypes: Block["type"][] = Object.keys(
      editor.schema
    ) as Block["type"][];

    const currentBlockType: Block["type"] =
      editor.getTextCursorPosition().block.type;

    const nextBlockType: Block["type"] =
      allBlockTypes[
        (allBlockTypes.indexOf(currentBlockType) + 1) % allBlockTypes.length
      ];

    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: nextBlockType,
    });
  }
};


const insertHelloWorld = (editor: BlockNoteEditor) => {
  
  const currentBlock: Block = editor.getTextCursorPosition().block;
 
  const codeBlock: PartialBlock = {
    type: "paragraph",
    content: [{ type: "text", text: "Write your code ", styles:{backgroundColor: "0F0F0F" } }],
  };

   
  editor.insertBlocks([codeBlock], currentBlock, "after");
};

const insertHelloWorldItem: ReactSlashMenuItem = {
  name: "Insert a code block",
  execute: insertHelloWorld,
  aliases: ["helloworld", "hw"],
  group: "Other",
  icon: <HiOutlineGlobeAlt size={18} />,
  hint: "Used to insert a your code block",
   
};

const customSlashMenuItemList = [
  ...getDefaultReactSlashMenuItems(),
  insertHelloWorldItem,
];

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
};

const Editor = ({
  onChange,
  initialContent,
  editable
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ 
      file
    });

    return response.url;
  }

  const editor: BlockNoteEditor = useBlockNote({
    slashMenuItems: customSlashMenuItemList,
    editable,
    initialContent: 
      initialContent 
      ? JSON.parse(initialContent) as PartialBlock[] 
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload
  })

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  )
}

export default Editor;

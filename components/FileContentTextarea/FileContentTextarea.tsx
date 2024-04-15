import React, { MutableRefObject, useEffect, useState } from "react";
import Controls from "../Controls/Controls";
import Button from "../ui/Button/Button";
import IconSave from "../svg/Save";
import { FileTree } from "@/app/files/[...path]/page";
import splitPathname from "@/shared/functions/splitPathname";
import { readFile } from "@/shared/fileHelpers";
import { usePathname } from "next/navigation";

interface Props {
  treeRef: MutableRefObject<FileTree | undefined>;
}

function FileContentTextarea({ treeRef }: Props) {
  const [text, setText] = useState<string>("");
  const pathname = usePathname();

  const saveText = () => {
    if (treeRef.current) {
      treeRef.current.current.value = {
        data: text,
        _meta: {
          ...treeRef.current.current.value._meta,
          updated: new Date(Date.now()).getTime(),
        },
      };
    }
  };

  useEffect(() => {
    setText("");
    readFile(splitPathname(pathname))
      .then((res: any) => {
        setText(res);
      })
      .catch((e) => {
        console.warn(e);
      });
  }, []);

  return (
    <>
      <Controls fileType={null} onBack={() => window.history.back()}>
        <Button onClick={() => saveText()}>
          <IconSave width={24} />
        </Button>
      </Controls>
      <textarea
        className="w-full mt-2 border border-slate-200"
        name=""
        id=""
        rows={20}
        value={text}
        onInput={(e: any) => setText(e.target.value)}
      ></textarea>
    </>
  );
}

export default FileContentTextarea;

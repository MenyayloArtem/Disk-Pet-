import { FileTypes } from '@/app/page';

import React, { useEffect, useRef, useState } from 'react';
import IconFile from '../svg/File';
import IconFolder from '../svg/Folder';
import Button from '../ui/Button/Button';
import Input, { InputType } from '../ui/Input/Input';

interface Props {
    fileType : FileTypes,
    onCreate : (name : string) => void,
    inputRef? : any
}

function TableCreateItemInput ({fileType, onCreate} : Props) {
  const inputRef = useRef<any>()
    const [fileWarn, setFileWarn] = useState<string>("")
    const [newElName, setNewElName] = useState<string>("");

    useEffect(() => {
        let filenameSplit = newElName.split(".").filter((item) => item);
        if (fileType == "file" && filenameSplit.length < 2 && newElName.length) {
          setFileWarn("Необходимо указать расширение файла");
        } else {
          setFileWarn("");
        }
      }, [newElName, fileType]);

      useEffect(() => {
        inputRef.current.focus()
      }, [fileType])

    const beforeCreate = (name : string) => {
        if (name) {
            onCreate(name)
        } else {
            setFileWarn("Укажите название файла")
        }
    }

    return <div className="flex">
    <Input
    onInit={(ref : any) => inputRef.current = ref.current}
      placeholder={
        fileType === "file"
          ? "File Name"
          : "Folder Name"
      }

      type={fileWarn ? InputType.Warn : undefined}
      before={
        <>
          {fileType == "file" ? (
            <IconFile width={16} />
          ) : (
            <IconFolder width={18} />
          )}
        </>
      }
      onInput={(e: any) => setNewElName(e.target.value)}
      onEnterPress={() => beforeCreate(newElName)}
      after={
        <Button
          onClick={() => beforeCreate(newElName)}
        >
          OK
        </Button>
      }
      bottom={
        fileWarn && (
          <div className="text-red-400 text-xs">
            {fileWarn}
          </div>
        )
      }
    />
  </div>
}

export default TableCreateItemInput
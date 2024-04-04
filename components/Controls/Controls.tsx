"use server"

import React, { useState } from 'react';
import Button, { ButtonTypes } from '../ui/Button/Button';
import AddFile from '../svg/AddFile';
import IconFolderAdd from '../svg/AddFolder';
import IconClose from '../svg/Close';
import { FileTypes } from '@/app/page';

interface Props {
    onChangeFileType : (type : FileTypes) => void,
    fileType : FileTypes
}

async function Controls (props : Props) {

    return <div className="flex gap-2 my-2">
    <Button onClick={() => props.onChangeFileType("file")}>
      <AddFile width={22} />
    </Button>
    <Button onClick={() => props.onChangeFileType("folder")}>
      <IconFolderAdd width={22} />
    </Button>
    {props.fileType && <Button
      type={ButtonTypes.Outlined}
      onClick={() => props.onChangeFileType(null)}
    >
      <IconClose width={22} />
    </Button>}
  </div>
}

export default Controls
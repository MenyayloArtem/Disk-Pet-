import React from 'react';
import Button, { ButtonTypes } from '../ui/Button/Button';
import AddFile from '../svg/AddFile';
import IconFolderAdd from '../svg/AddFolder';
import IconClose from '../svg/Close';
import TableRow from '../TableRow/TableRow';
import TableCell from '../TableCell/TableCell';
import IconFolder from '../svg/Folder';
import IconFile from '../svg/File';


interface Props {

}

function TableHistoryCaption (props : any) {
    return <caption className="text-slate-500 dark:text-slate-400 py-2 caption-top text-left text-xl">
    <div className="flex gap-1">
      {history.map((item, i) => {
        return (
          <button className="flex gap-1"
            onClick={() =>back(i + 1 !== history.length ? history.length - (i + 1) : 0)}
            key={i}
          >
            {item}
            {i + 1 !== history.length && history.length > 1 && (
              <span>&gt;</span>
            )}
          </button>
        );
      })}
    </div>
      {props.children}
  </caption>
}

function Table (props : Props) {
    return <table className="border-collapse table-auto w-full text-sm bg-gray-100">

    <TableHistoryCaption>
        <div className="flex gap-2 my-2">
            <Button onClick={() => setNewFileType("file")}>
            <AddFile width={22} />
            </Button>
            <Button onClick={() => setNewFileType("folder")}>
            <IconFolderAdd width={22} />
            </Button>
            <Button
            type={ButtonTypes.Outlined}
            onClick={() => setNewFileType(null)}
            >
            <IconClose width={22} />
            </Button>
        </div>
    </TableHistoryCaption>
      


    <thead>
      <tr>
        <th className="border dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3 text-slate-400 dark:text-slate-200 text-left"
          style={{ width: "30%" }}>
          Name
        </th>
        <th className="border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3 text-slate-400 dark:text-slate-200 text-left">
          Info
        </th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-slate-800">
      {(!searched.length || (searched.length && !search)) &&
        expanded.map((item) => {
          let isFolder = treeRef.current?.current.children![item].children;
          return (
            <TableRow key={item}>
              <TableCell>
                <div className="flex items-center gap-2"
                onClick={() => expand(item)}
                >
                  {isFolder ? (
                    <IconFolder
                      width={14}
                    />
                  ) : (
                    <IconFile
                      width={14}
                    />
                  )}
                  {item}
                </div>
              </TableCell>
              <TableCell>Info</TableCell>
            </TableRow>
          );
        })}

      {!!searched.length &&
        search &&
        searched.map((item, i) => {
          return (
            <tr key={i}>
              <td className="border border-slate-200 dark:border-slate-600 p-4 pl-8 text-slate-500 dark:text-slate-400">
                {item.matched}
              </td>
              <td
                className="border border-slate-200 dark:border-slate-600 p-4 pr-8 text-slate-500 dark:text-slate-400"
                onClick={() => goToPath(item.path)}>
                {[treeRef.current?.root.key, ...item.path].join(" > ")}
              </td>
            </tr>
          );
        })}

      {newFileType && (
        <tr>
          <TableCell>
            {
              <div className="flex">
                <Input
                  placeholder={
                    newFileType === "file"
                      ? "File Name"
                      : "Folder Name"
                  }
                  type={fileWarn ? InputType.Warn : undefined}
                  before={<>
                      {newFileType == "file" ? (
                        <IconFile width={16} />
                      ) : (
                        <IconFolder width={18} />
                      )}
                  </>}
                  onInput={(e: any) => setNewElName(e.target.value)}
                  onEnterPress={() => addNewElement(newElName)}
                  after={<Button onClick={() => addNewElement(newElName)}>
                      OK
                    </Button>
                  }
                  bottom={fileWarn && (<div className="text-red-400 text-xs">
                    {fileWarn}
                  </div>)}
                />
              </div>
            }
          </TableCell>
          <TableCell>
            Enter file or folder name
          </TableCell>
        </tr>
      )}
    </tbody>
  </table>
}

export default Table
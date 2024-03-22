import React from 'react';
import "./TableCell.scss"

interface Props {
    children? : React.ReactNode
}

function TableCell (props : Props) {
    return <td className="border border-slate-200 dark:border-slate-600 p-4 pl-8 text-slate-500 dark:text-slate-400"
    >{props.children}</td>
}

export default TableCell
import React from 'react';

interface Props {
    children : React.ReactNode
}

function TableBody (props : Props) {
    return <tbody className="bg-white dark:bg-slate-800">
        {props.children}
    </tbody>
}

export default TableBody
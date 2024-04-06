import React from 'react';

interface Props {
    children : React.ReactNode
}

function TableCaption (props : Props) {
    return <caption className="text-slate-500 dark:text-slate-400 py-2 caption-top text-left text-xl">
        {props.children}
    </caption>
}

export default TableCaption
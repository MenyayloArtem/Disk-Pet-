import React from 'react';

interface NameItem {
    name : string,
    width? : string
}

interface Props {
    names : NameItem[]
}

function TableHeadItem (props : NameItem) {
    return <th
    className="border dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3 text-slate-400 dark:text-slate-200 text-left"
    style={{ width: props.width }}
  >
    {props.name}
  </th>
}

function TableHead (props : Props) {
    return <thead>
    <tr>
        {
            props.names.map((name,i) => {
               return <TableHeadItem key={i} {...name}/>
            })
        }
      
    </tr>
  </thead>
}

export default TableHead
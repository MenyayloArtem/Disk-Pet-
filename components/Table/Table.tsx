import React from 'react';

interface Props {
  children : React.ReactNode
}

function Table (props : Props) {
    return <table className="border-collapse table-auto w-full text-sm bg-gray-100">
      {props.children}
  </table>
}

export default Table
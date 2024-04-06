import React from 'react';

interface Props {
    history : string[],
    onChange : (i : number) => void
}

function TableCaptionHistory ({history, onChange} : Props) {
    return <div className="flex gap-1">
    {history.map((item, i) => {
      return (
        <button className="flex gap-1"
          onClick={() => onChange(i)}
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
}

export default TableCaptionHistory
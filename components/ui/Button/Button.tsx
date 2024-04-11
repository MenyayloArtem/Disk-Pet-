import React from 'react';
import "./Button.scss"

export enum ButtonTypes {
  Primary = "primary",
  Outlined = "outlined"
}

interface Props {
  disabled? : boolean,
  selected? : boolean,
  children? : React.ReactNode,
  before? : React.ReactNode,
  type? : ButtonTypes,
  onClick? : Function
}

const styles : {[x : string] : string} = {
  [ButtonTypes.Primary] : "bg-blue-500 hover:bg-blue-700 text-white",
  [ButtonTypes.Outlined] : "hover:bg-gray-200 text-blue-500 border-solid border-[2px] border-blue-500"
}

function Button (props : Props) {
    const type = props.type || ButtonTypes.Primary

    const onClick = () => {
      if (props.onClick) {
        props.onClick()
      }
    }

    return <button className={"Button max-h-[38px] flex items-center gap-1 py-2 px-4 " + styles[type]}
    onClick={() => onClick()}
    >
    {props.before}
    {props.children}
  </button>
}

export default Button
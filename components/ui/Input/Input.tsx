"use client"

import React, { useEffect, useRef, useState } from 'react';
import "./Input.scss"

interface Props {
    streched? : boolean,
    width? : string,
    placeholder? : string,
    onInput? : Function,
    onEnterPress? : Function,
    after? : React.ReactNode,
    before? : React.ReactNode,
    bottom? : React.ReactNode,
    type? : InputType,
    autofocus? : boolean,
    onInit? : Function,
    value? : string
}

export enum InputType {
    Default = "default",
    Warn = "warn"
}

const borderStyles = {
    [InputType.Default] : "border-gray-300 text-gray-500 placeholder:text-gray-500",
    [InputType.Warn] : "border-red-300 text-red-300 placeholder:text-red-300"
}

function Input (props : Props) {
    const [width, setWidth] = useState<string>("auto")
    const [value, setValue] = useState<string>(props.value || "")
    const ref = useRef<any>()

    useEffect(() => {
        if (props.onInit) {
            props.onInit(ref)
        }
    },[])

    useEffect(() => {
        if (props.onEnterPress && ref.current) {
            const handler = (e : any) => {
                if (e.code === "Enter") {
                    if (props.onEnterPress) {
                        props.onEnterPress()
                    }
                }
            }
            ref.current.addEventListener("keyup", handler)

            return () => ref.current?.removeEventListener("keyup", handler)
        }
        if (props.width) {
            setWidth(props.width)
        } else if (props.streched) {
            setWidth("100%")
        }
    }, [props?.onEnterPress])

    const onInput = (e : any) => {
        setValue(e.target.value)
        if (props.onInput) {
            props.onInput(e)
        }
    }

    useEffect(() => {
        setValue(props?.value || "")
    }, [props.value])

    const borderType = props.type || InputType.Default

    
    return <div className={` ${borderStyles[borderType]}`}
    style={{width}}
    >

        <div className="relative flex items-center">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
      {props.before}
    </div>
    
    <input type="text" id="input-group-1" ref={ref}
    autoFocus={props.autofocus}
    className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 
    dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
    ${borderStyles[borderType]}
    `}
    placeholder={props.placeholder}
    value={value}
    onInput={(e) => onInput(e)}
    />
    {props.after}
        </div>
        <div className="mt-1 pointer-events-none">
      {props.bottom}
    </div>
    
  </div>
}

export default Input
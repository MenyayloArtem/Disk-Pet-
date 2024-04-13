import React from 'react';
import "./ProgressBar.scss"

interface Props {
    progress : number
}

let styles = {
    ok : "bg-blue-600 h-1.5 rounded-full dark:bg-blue-500",
    err : "bg-red-400 h-1.5 rounded-full dark:bg-blue-500"
}

function ProgressBar (props : Props) {
    // let color = "blue-600"

    // if (props.progress >= 80) {
    //     color = "red-400"
    // }
    return <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
    <div className={styles[props.progress < 80 ? "ok" : "err"]} style={{
        width : `${props.progress}%`
    }}></div>
  </div>
}

export default ProgressBar
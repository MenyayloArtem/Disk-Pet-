import React from 'react';
import "./ProgressBar.scss"

interface Props {
    progress : number
}

function ProgressBar (props : Props) {
    return <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
    <div className="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500" style={{
        width : `${props.progress}%`
    }}></div>
  </div>
}

export default ProgressBar
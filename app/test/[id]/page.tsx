import { GetStaticPaths } from 'next';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import { ParsedUrl } from 'next/dist/shared/lib/router/utils/parse-url';
import React from 'react';

interface Props {
    params : {
        id : string
    }
}

async function getTodo (id : number) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
    const json = await res.json()
    console.log("todo")
    return json
}

async function itemData (props : Props) {
    const todo = await getTodo(+props.params.id)
    return <div>
        {todo.title}
    </div>
}

export default itemData

// export async function getStaticPaths () : Promise<NextParsedUrlQuery> {
//     const res = await fetch("https://jsonplaceholder.typicode.com/todos/")
//     const json = await res.json()
//     console.log("fetching...")

//     const paths = json.map((item : any) => {
//         return {
//             params : {id : String(item.id)}
//         }
//     })

//     return {
//         paths,
//         fallback : "blocking"
//     }
// }


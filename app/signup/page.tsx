import React from 'react';

interface Props {

}

async function page () {
    const data = await getData()
    return <div>
        Signup

        <div className="mt-1">
            {
                data.map((item) => {
                    return <div
                    key={item.id}
                    >
                        {item.title}
                    </div>
                })
            }
        </div>
    </div>
}

async function getData() {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
        next : {
            revalidate : 10,
        },
    })
    const todos = await res.json()

    return todos as any[]
}

export default page
import React from 'react';

interface Props {
    params : {
        id : string
    }
}

function itemData (props : Props) {
    return <div>
        Item {props.params.id}
    </div>
}

export default itemData
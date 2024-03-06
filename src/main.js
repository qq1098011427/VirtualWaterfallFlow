import App from './App';
import React, {useEffect, useRef, useState} from "react";
import {list} from './constants'

const Entry = () => {
    const pageSize = 20
    const [column, setColumn] = useState(2)
    const entryRef = useRef(null)
    const containerObserver = new ResizeObserver((entries) => {
        console.log('entries[0].target.clientWidth', entries[0].target.clientWidth)
        changeColumn(entries[0].target.clientWidth);
    });
    const changeColumn = (width) => {
        let realColumn = 3
        if (width > 1000) {
            realColumn = 5;
        } else if (width >= 700 && width < 1000) {
            realColumn = 4;
        } else if (width >= 500 && width < 700) {
            realColumn = 3;
        } else {
            realColumn = 2;
        }
        console.log(realColumn, '==realColumn==')
        setColumn(realColumn);
    }
    const request = (page, pageSize) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize));
            }, 1000);
        });
    };
    useEffect(() => {
        entryRef.current && containerObserver.observe(entryRef.current);
        return () => {
            entryRef.current && containerObserver.unobserve(entryRef.current);
        }
    }, [])
    return <div ref={entryRef}>
        <App
            column={column}
            request={request}
            pageSize={pageSize}
            gap={20} />
    </div>;
}
export default Entry;

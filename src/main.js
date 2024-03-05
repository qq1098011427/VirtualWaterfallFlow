import App from './App';
import React, {useEffect, useRef, useState} from "react";
import {list} from './constants'

const Entry = () => {
    const pageSize = 20
    const [column, setColumn] = useState(3)
    const entryRef = useRef(null)
    const containerObserver = new ResizeObserver((entries) => {
        changeColumn(entries[0].target.clientWidth);
    });
    const changeColumn = (width) => {
        let realColumn = 3
        if (width > 1000) {
            realColumn = 5;
        } else if (width >= 600 && width < 800) {
            realColumn = 4;
        } else if (width >= 400 && width < 600) {
            realColumn = 3;
        } else {
            realColumn = 2;
        }
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

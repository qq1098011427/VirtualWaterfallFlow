import App from './App';
import React, {useRef} from "react";
import {list} from './constants'

console.log(list, '数据总计');
const Entry = () => {
    const pageSize = 20
    const entryRef = useRef(null)
    const request = (page, pageSize) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize));
            }, 500);
        });
    };
    return <div ref={entryRef}>
        <App
            request={request}
            pageSize={pageSize}
            gap={20} />
    </div>;
}
export default Entry;

import './index.less'
import React, {useEffect, useMemo, useRef, useState} from "react";
import {rafThrottle} from "./utils";

const App = (props) => {
    const { column, gap, pageSize, request } = props
    const containerRef = useRef(null)
    const [isFinish, setIsFinish] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [list, setList] = useState([])
    const scrollStateRef = useRef({
        viewHeight: 0,
        viewWidth: 0,
        start: 0 // scrollTop
    })
    const end = scrollStateRef.current.start + scrollStateRef.current.viewHeight
    const queueRef = useRef(Array(column).fill(0).map(() => ({ list: [], height: 0 })))
    const lenRef = useRef(0)
    const itemSizeMapRef = useRef(new Map())
    const columnMinHeightRef = useRef(0)
    const [columnMaxHeight, setColumnMaxHeight] = useState(0)
    const columnMinIndexRef = useRef(0)
    const computeColumnInfo = (quene) => {
        let columnMinHeight = Infinity
        let columnMaxHeight = -Infinity
        quene.forEach(({ height }, index) => {
            if (height < columnMinHeight) {
                columnMinHeight = height
                columnMinIndexRef.current = index
            }
            if (height > columnMaxHeight) {
                columnMaxHeight = height
            }
        });
        columnMinHeightRef.current = columnMinHeight
        setColumnMaxHeight(columnMaxHeight)
    }
    const createRealItem = (dataItem, lastItem, minIndex) => {
        const rect = itemSizeMapRef.current.get(dataItem.id)
        const { width, height } = rect
        const y = lastItem ? lastItem.y + lastItem.h + gap : 0
        return {
            item: dataItem,
            y,
            h: height,
            imageHeight: 0,
            style: {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate3d(${minIndex === 0 ? 0 : (width + gap) * minIndex}px, ${y}px, 0)`,
            }
        }
    }
    const addToQueue = (size) => {
        for (let i = 0; i < size; i++) {
            // 最小高度列的索引
            const minIndex = columnMinIndexRef.current
            // 需要添加数据的列
            const curColumn = queueRef.current[minIndex]
            // 拿到最后一项
            const lastItem = curColumn.list[curColumn.list.length - 1] || null
            const dataItem = list[lenRef.current]
            const item = createRealItem(dataItem, lastItem, minIndex)
            curColumn.list.push(item)
            curColumn.height += item.h
            computeColumnInfo(queueRef.current)
            console.log(queueRef.current, '==queueRef==')
            lenRef.current += 1
        }
    }
    const getList = async () => {
        if (isFinish) return
        setLoading(true)
        const l = await request(pageIndex, pageSize);
        if (!l?.length) {
            setIsFinish(true)
            setLoading(false)
            return
        }
        const newList = list
        newList.push(...l)
        setList(newList)
        return l.length
    }
    const initScrollState = () => {
        scrollStateRef.current.viewWidth = containerRef.current.clientWidth;
        scrollStateRef.current.viewHeight = containerRef.current.clientHeight;
        scrollStateRef.current.start = containerRef.current.scrollTop;
    };
    useEffect( () => {
        const run = async () => {
            initScrollState();
            const len = await getList();
            if (len) {
                itemSizeMapRef.current = list.reduce((pre, cur) => {
                    const { width: w, height: h, id } = cur
                    const width = Math.floor((scrollStateRef.current.viewWidth - (column - 1) * gap) / column)
                    pre.set(id, {
                        width,
                        height: Math.floor(h * width / w)
                    })
                    return pre
                }, new Map())
                addToQueue(len);
            }
            console.log(itemSizeMapRef.current, '==itemSizeMapRef.current==');
            const onscroll = rafThrottle(() => {
                const { scrollTop, clientHeight } = containerRef.current;
                scrollStateRef.current = scrollTop;
                if (scrollTop + clientHeight > columnMinHeightRef.current) {
                    !loading && getList().then((len) => {
                        len && addToQueue(len);
                    });
                }
            })
            window.addEventListener('scroll', onscroll);
        }
        run()
        return () => {
            window.removeEventListener('scroll', onscroll)
        }
    }, [])

    const renderList = useMemo(() => {
        const l = queueRef.current.reduce((pre, { list }) => pre.concat(list), [])
        return l.filter((i) => i.h + i.y > scrollStateRef.current.start && i.y < end)
    }, [JSON.stringify(queueRef.current), scrollStateRef.current, end])
    console.log(renderList, '==renderList==')
    const listStyle = { height: `${columnMaxHeight}px` }
    return <div className="container" ref={containerRef}>
        <div className="list" style={listStyle}>
            {renderList.map(({item, style}) => {
                return <div
                        className="card-container item"
                        style={style}
                        key={item.id}>
                    <div className="card-image" style={{
                        // height: `${item.imageHeight}px`,
                        flex: 1,
                        background: `${item.bgColor}`
                    }}></div>
                    <div className="card-footer">
                        <div className="title">{item.title}</div>
                        <div className="author">
                            <div className="author-info">
                                <div className="avatar"/>
                                <span className="name">{item.author}</span>
                            </div>
                            <div className="like">100</div>
                        </div>
                    </div>
                </div>
            })}
        </div>
    </div>;
}


export default App;

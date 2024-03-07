import './index.less'
import React, {useEffect, useMemo, useRef, useState} from "react";
import {debounce, rafThrottle} from "./utils";
const changeColumn = (width) => {
    let realColumn
    if (width > 1000) {
        realColumn = 5;
    } else if (width >= 700 && width < 1000) {
        realColumn = 4;
    } else if (width >= 500 && width < 700) {
        realColumn = 3;
    } else {
        realColumn = 2;
    }
    return realColumn
}
const App = (props) => {
    const { gap, pageSize, request } = props
    const column = changeColumn(document.body.clientWidth)
    const containerRef = useRef(null)
    const isFinishRef = useRef(false)
    const loadingRef = useRef(false)
    const pageIndexRef = useRef(1)
    const listRef = useRef([])
    const scrollStateRef = useRef({
        viewHeight: 0,
        viewWidth: 0,
    })
    const [start, setStart] = useState(0) // scrollTop
    const end = start + scrollStateRef.current.viewHeight
    const queueRef = useRef(Array(column).fill(0).map(() => ({ list: [], height: 0 })))
    const lenRef = useRef(0)
    const tempListRef = useRef([]) // 临时渲染列表，获取完高度后隐藏并清空
    const [tempListShow, setTempListShow] = useState(false)
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
        const { width, height, imageHeight } = rect
        const y = lastItem ? lastItem.y + lastItem.h + gap : 0
        return {
            item: dataItem,
            y,
            h: height,
            imageHeight,
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
            const dataItem = listRef.current[lenRef.current]
            const item = createRealItem(dataItem, lastItem, minIndex)
            curColumn.list.push(item)
            curColumn.height += item.h
            computeColumnInfo(queueRef.current)
            lenRef.current += 1
        }
    }
    const addToTempList = (size = column * 2) => {
        if (!(lenRef.current < listRef.current.length)) return
        for (let i = 0; i < size; i++) {
            const item = listRef.current[lenRef.current + i];
            if (!item) break;
            const rect = itemSizeMapRef.current.get(item.id);
            tempListRef.current.push({
                item,
                y: 0,
                h: 0,
                imageHeight: rect.imageHeight,
                style: {
                    width: `${rect.width}px`,
                },
            });
        }
        setTempListShow(true)
    }
    const getList = async () => {
        if (isFinishRef.current) return {
            length: 0,
            curList: []
        }
        loadingRef.current = true
        const l = await request(pageIndexRef.current, pageSize);
        if (!l?.length) {
            isFinishRef.current = true
            loadingRef.current = false
            return {
                length: 0,
                curList: []
            }
        }
        listRef.current.push(...l)
        loadingRef.current = false
        pageIndexRef.current += 1
        return {
            length: l.length,
            curList: l
        }
    }
    const initScrollState = () => {
        scrollStateRef.current.viewWidth = containerRef.current.clientWidth;
        scrollStateRef.current.viewHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTop = 0
        setStart(containerRef.current.scrollTop)
    };
    const computeItemSizeMap = (arr) => {
        itemSizeMapRef.current = arr.reduce((pre, cur) => {
            const { width: w, height: h, id } = cur
            const width = Math.floor((scrollStateRef.current.viewWidth - (column - 1) * gap) / column)
            // 滚动以及重新计算都会将已经计算的真实高度重置为 0
            const rect = itemSizeMapRef.current.get(id)
            pre.set(id, {
                width,
                imageHeight:  Math.floor(h * width / w),
                height: rect ? rect.height : 0
            })
            return pre
        }, new Map())
    }
    const containerObserver = new ResizeObserver((entries) => {
        const column = changeColumn(entries[0].target.clientWidth);
        run(column)
    })
    const run = debounce(async (column) => {
        initScrollState();
        queueRef.current = Array(...column).fill(0).map(() => ({ list: [], height: 0 }))
        lenRef.current = 0
        columnMinHeightRef.current = 0
        columnMinIndexRef.current = 0
        computeItemSizeMap(listRef.current)
        // addToQueue(list.length);
        addToTempList(pageSize)
    }, 300)
    useEffect( () => {
        const getData = async () => {
            initScrollState();
            const {length, curList} = await getList();
            if (length) {
                computeItemSizeMap(curList)
                // addToQueue(length);
                addToTempList(length)
            }
        }
        getData()
        const onscroll = rafThrottle((args) => {
            const { scrollTop, clientHeight } = containerRef.current;
            setStart(scrollTop)
            if (!loadingRef.current && !(lenRef.current < listRef.current.length)) {
                getList().then((res) => {
                    console.log('走这里需要请求')
                    const {length, curList} = res
                    if (length) {
                        computeItemSizeMap(curList)
                        // addToQueue(length);
                        addToTempList()
                    }
                });
            }
            if (scrollTop + clientHeight > columnMinHeightRef.current) {
                console.log('走这里不请求')
                addToTempList()
            }
        })
        containerRef.current.addEventListener('scroll', onscroll);
        containerRef.current && containerObserver.observe(containerRef.current);
        return () => {
            containerRef.current.removeEventListener('scroll', onscroll)
            containerRef.current && containerObserver.unobserve(containerRef.current);
        }
    }, [column])
    useEffect(() => {
        if (!tempListShow) return
        const tempListDom = document.querySelector('.tempList');
        [...tempListDom.children].forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            tempListRef.current[index].h = rect.height;
        });
        tempListRef.current.forEach(({ item, h }) => {
            const rect = itemSizeMapRef.current.get(item.id);
            itemSizeMapRef.current.set(item.id, { ...rect, height: h });
        });
        addToQueue(tempListRef.current.length);
        tempListRef.current = [];
        setTempListShow(false)
    }, [tempListShow])
    const renderList = useMemo(() => {
        const l = queueRef.current.reduce((pre, { list }) => pre.concat(list), [])
        return l.filter((i) => i.h + i.y > start && i.y < end)
    }, [JSON.stringify(queueRef.current), end])
    const listStyle = { height: `${columnMaxHeight}px` }
    console.log('渲染列表', renderList)
    const renderItem = ((item, style, imageHeight) => {
        return <div
            className="card-container item"
            style={style}
            key={item.id}>
            <div className="card-image" style={{
                height: `${imageHeight}px`,
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
    })
    return <div className="container" ref={containerRef}>
        <div className="list" style={listStyle}>
            {!tempListShow
                ? <div className="renderList">
                {renderList.map(({item, style, imageHeight}) => {
                    return renderItem(item, style, imageHeight)
                })}
            </div>
                : <div className="tempList">
                    {tempListRef.current.map(({item, style, imageHeight}) => {
                        const _style = {
                            ...style,
                            height: 'auto'
                        }
                        return renderItem(item, _style, imageHeight)
                    })}
                </div>}
        </div>
    </div>;
}


export default App;

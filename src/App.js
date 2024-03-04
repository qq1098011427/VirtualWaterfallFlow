import React from "react";
import Page1 from './page1'
import Page2 from './page2'
import {Routes, Route, HashRouter, NavLink, useLocation, Navigate, useRoutes} from 'react-router-dom';

const Layout = () => {
    const location = useLocation()
    const routes = [
        {
            path: "/",
            element: <Navigate to="/home/page1" />
        },
        {
            path: "/page1",
            element: <Page1 />,
        },
        {
            path: "/page2",
            element: <Page2 />,
        }
    ]

    return (
        <div>
            <div className="header">
                <NavLink
                    to='/home/page1'
                    style={{color: location.pathname === '/home/page1' ? 'blue' : 'black'}}>
                    页面1
                </NavLink>
                <NavLink
                    to='/home/page2'
                    style={{color: location.pathname === '/home/page2' ? 'blue' : 'black'}}>
                    页面2
                </NavLink>
            </div>
            {useRoutes(routes)}
            <div className="footer">
                FOOTER
            </div>
        </div>
    )
}


function App() {
    return (
        <HashRouter>
                <div className="App">
                    <Routes>
                        <Route path='/' element={<Navigate to="/home" />} />
                        <Route path='/home/*' element={<Layout />} />
                        <Route path='*' element={<div>404</div>} />
                    </Routes>
                </div>
        </HashRouter>
    );
}

export default App;

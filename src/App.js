import { Col, Row, Select, Spin } from 'antd'
import crypto from 'crypto-js'
import React, { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.scss'
import Check from './feature/check'
import Home from './feature/home'

const { Option } = Select

function App() {
    return (
        <Suspense
            fallback={
                <Row justify="center" align="middle">
                    <div>
                        <Spin size="large" tip="Loading..." />
                    </div>
                </Row>
            }
        >
            <Row>
                <BrowserRouter>
                    <Col xs={24}>
                        <Routes>
                            <Route path="*" element={<Navigate to="/home" />} />
                            <Route path={'/home'} element={<Home />} />)
                            <Route path={'/check'} element={<Check />} />)
                        </Routes>
                    </Col>
                </BrowserRouter>
            </Row>
        </Suspense>
    )
}

function anonymizeData(type, policy, output, data, key) {
    const response = [...data]
    switch (type) {
        case 'DES':
            response.map((val) => {
                policy.map((field) => {
                    return (val[field] = crypto.DES.encrypt(val[field], key).toString())
                })
            })
            break
        case 'TripleDES':
            response.map((val) => {
                policy.map((field) => {
                    return (val[field] = crypto.TripleDES.encrypt(val[field], key).toString())
                })
            })
            break
        case 'Rabbit':
            response.map((val) => {
                policy.map((field) => {
                    return (val[field] = crypto.Rabbit.encrypt(val[field], key).toString())
                })
            })
            break
        case 'RC4':
            response.map((val) => {
                policy.map((field) => {
                    return (val[field] = crypto.RC4.encrypt(val[field], key).toString())
                })
            })
            break

        default:
            response.map((val) => {
                policy.map((field) => {
                    return (val[field] = crypto.AES.encrypt(val[field], key).toString())
                })
            })
            break
    }

    return response
}

export default App

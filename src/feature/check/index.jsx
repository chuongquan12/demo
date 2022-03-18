import { Col, Input, Row, Select } from 'antd'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { checkData, processData } from '../../functions'
import { Button, notification, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Option } = Select

function Check(props) {
    const [data, setData] = useState([])
    const [visibleBtn, setVisibleBtn] = useState(false)
    const [visibleHeader, setVisibleHeader] = useState(true)
    const [dataOptions, setDataOptions] = useState({
        type: 'AES',
        passphrase: '',
    })

    const openNotificationWithIcon = (type, description) => {
        notification[type]({
            description: description,
        })
    }

    // handle file upload
    const handleFileUpload = (e) => {
        setVisibleBtn(true)

        const file = e.target.files[0]
        const reader = new FileReader()
        const arrOptions = []
        reader.onload = (evt) => {
            const bstr = evt.target.result
            const wb = XLSX.read(bstr, { type: 'binary' })

            /* Get first worksheet */
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, {})

            const obj = processData(data)
            obj.columns.map((value, index) => {
                return arrOptions.push({ label: value.name, value: value.name })
            })
            setData(obj)
        }
        reader.readAsBinaryString(file)
    }

    const handleCheckData = (value) => {
        let valueCheckData = false
        valueCheckData = checkData(value.type, data.data, value.passphrase) || false
        if (valueCheckData) {
            openNotificationWithIcon('success', 'True')
        } else {
            openNotificationWithIcon('error', 'ERROR')
        }
    }

    return (
        <Row className="app" justify="center">
            {visibleHeader ? (
                <Col>
                    <Row>
                        <Col className={`app__header`}>
                            <Row align="middle">
                                <span className="app__header--title">Check File Here</span>
                            </Row>
                            <label>Choose a CSV file: </label>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                            />
                        </Col>
                    </Row>
                    <Row>
                        {visibleBtn && (
                            <button
                                className={`app__btn`}
                                onClick={() => {
                                    data && setVisibleHeader(false)
                                }}
                            >
                                Next
                            </button>
                        )}
                    </Row>
                    <Row>
                        <NavLink to={'/home'} className={`app__btn`}>
                            Anonymize File
                        </NavLink>
                    </Row>
                </Col>
            ) : (
                <Col xs={22} md={10}>
                    <Row>
                        <Col xs={24} className={`app__options`}>
                            <Row align="middle">
                                <span
                                    className="app__header--btn"
                                    onClick={() => setVisibleHeader(true)}
                                >
                                    <ArrowLeftOutlined />
                                </span>
                                <span className="app__header--title">Choose your options</span>
                            </Row>

                            <Row justify="space-between" align="center">
                                <label className={`app__options--label`}>
                                    Choose anonymized technique
                                </label>
                                <Select
                                    className={`app__options--select`}
                                    defaultValue={dataOptions.type}
                                    bordered={false}
                                    onChange={(val) =>
                                        setDataOptions({ ...dataOptions, type: val })
                                    }
                                >
                                    <Option value="AES">AES</Option>
                                    <Option value="DES">DES</Option>
                                    <Option value="TripleDES">TripleDES</Option>
                                    <Option value="Rabbit">Rabbit</Option>
                                    <Option value="RC4">RC4</Option>
                                </Select>
                            </Row>

                            <Row justify="space-between" align="center">
                                <label className={`app__options--label`}>Enter Passphrase</label>
                                <Col xs={14}>
                                    <Input
                                        onChange={(e) =>
                                            setDataOptions({
                                                ...dataOptions,
                                                passphrase: e.target.value,
                                            })
                                        }
                                        placeholder="Passphrase"
                                        className={`app__options--input`}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <button className={`app__btn`} onClick={() => handleCheckData(dataOptions)}>
                            Check
                        </button>
                    </Row>
                </Col>
            )}
        </Row>
    )
}

export default Check

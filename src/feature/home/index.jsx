import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { CSVLink } from 'react-csv'
import { Modal, Checkbox, Col, Row, Select, Tag, Input } from 'antd'
import * as XLSX from 'xlsx'
import './home.scss'
import { anonymizeData, handlePolicy, processData } from '../../functions'
import fileApi from '../../api/fileApi'
import { NavLink } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Option } = Select

function Home(props) {
    const [data, setData] = useState([])
    const [visibleBtn, setVisibleBtn] = useState(false)
    const [visibleHeader, setVisibleHeader] = useState(true)
    const [isModalOptionsVisible, setModalOptionsVisible] = useState(false)
    const [isModalReviewVisible, setModalReviewVisible] = useState(false)
    const [plainOptions, setPlainOptions] = useState([])
    const [dataOptions, setDataOptions] = useState({
        type: 'AES',
        output: 'API',
        policy: [],
        passphrase: 'kyanon',
    })
    const [dataReview, setDataReview] = useState([])

    const postData = async (value) => {
        try {
            const response = await fileApi.postDataFile(value)
        } catch (error) {
            console.log(error)
        }
    }

    function handleOnReview(value) {
        let arrReview = []

        const arrPolicy = handlePolicy(value.policy)

        data.data.map((val, index) => {
            if (index < 10) return arrReview.push(val)
        })
        const dataAnonymized = anonymizeData(value.type, arrPolicy, arrReview, value.passphrase)
        const columns = data.columns
        columns.unshift({ name: 'HASH', selector: 'HASH' })

        setData({
            ...data,
            data: anonymizeData(value.type, arrPolicy, data.data, value.passphrase),
        })

        setDataReview({ data: dataAnonymized, columns: columns })
    }

    function handleAnonymize(value) {
        setVisibleHeader(true)
        setModalOptionsVisible(false)
        setModalReviewVisible(false)

        if (value.output === 'API') {
            data.data.map((val) => {
                return postData(val)
            })
        }
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
            setPlainOptions(arrOptions)
            setData(obj)
        }
        reader.readAsBinaryString(file)
    }

    useEffect(() => {
        !isModalReviewVisible && setDataReview([])
    }, [isModalReviewVisible])
    return (
        <Row className="app" justify="center">
            {visibleHeader ? (
                <Col>
                    <Row>
                        <Col className={`app__header`}>
                            <h1>Hi there</h1>
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
                        <NavLink to={'/check'} className={`app__btn`}>
                            Check File
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
                                <label className={`app__options--label`}>Choose policy</label>
                                <Col xs={14}>
                                    <Checkbox.Group
                                        className={`app__options--checkbox`}
                                        defaultValue={dataOptions.policy}
                                        onChange={(val) =>
                                            setDataOptions({
                                                ...dataOptions,
                                                policy: val,
                                            })
                                        }
                                    >
                                        {plainOptions.map((val, index) => {
                                            return (
                                                <Row
                                                    key={`checkbox-${index}`}
                                                    align="middle"
                                                    className={`app__options--checkbox-item`}
                                                >
                                                    <Checkbox value={`${val.value} - text`}>
                                                        {val.label}
                                                    </Checkbox>
                                                    {dataOptions.policy.map((policy, index) => {
                                                        if (policy.indexOf(val.value) !== -1)
                                                            return (
                                                                <Select
                                                                    key={`checkbox-select-${index}`}
                                                                    defaultValue={`${val.value} - text`}
                                                                    bordered={false}
                                                                    className={`app__options--select`}
                                                                    onChange={(valRandom) => {
                                                                        let temp = {
                                                                            ...dataOptions,
                                                                        }
                                                                        temp.policy[index] =
                                                                            valRandom

                                                                        setDataOptions(temp)
                                                                    }}
                                                                >
                                                                    <Option
                                                                        value={`${val.value} - text`}
                                                                    >
                                                                        Text
                                                                    </Option>
                                                                    <Option
                                                                        value={`${val.value} - number`}
                                                                    >
                                                                        Number
                                                                    </Option>
                                                                </Select>
                                                            )
                                                    })}
                                                </Row>
                                            )
                                        })}
                                    </Checkbox.Group>
                                </Col>
                            </Row>
                            <Row justify="space-between" align="center">
                                <label className={`app__options--label`}>Choose output</label>
                                <Select
                                    defaultValue={dataOptions.output}
                                    bordered={false}
                                    className={`app__options--select`}
                                    onChange={(val) =>
                                        setDataOptions({ ...dataOptions, output: val })
                                    }
                                >
                                    <Option value="API">API</Option>
                                    <Option value="File">File</Option>
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
                        <button
                            className={`app__btn`}
                            onClick={() => {
                                setModalOptionsVisible(true)
                            }}
                        >
                            Anonymized
                        </button>
                    </Row>
                </Col>
            )}

            <Modal
                title="Check Options"
                visible={isModalOptionsVisible}
                footer={null}
                onCancel={() => setModalOptionsVisible()}
            >
                <Row>
                    <Col xs={24} className={`app__options`}>
                        <Row justify="space-between" align="center">
                            <label className={`app__options--label`}>
                                Choose anonymized technique
                            </label>
                            <span className={`app__options-text`}>{dataOptions.type}</span>
                        </Row>
                        <Row justify="space-between" align="center">
                            <label className={`app__options--label`}>Choose policy</label>
                            <div className={`app__options--group`}>
                                {dataOptions.policy.map((value, index) => {
                                    return (
                                        <Tag
                                            key={`policy-${index}`}
                                            className={`app__options--group-text`}
                                            color="#1e1f21"
                                        >
                                            {`${value}`}
                                        </Tag>
                                    )
                                })}
                            </div>
                        </Row>
                        <Row justify="space-between" align="center">
                            <label className={`app__options--label`}>Choose output</label>
                            <span className={`app__options-text`}>{dataOptions.output}</span>
                        </Row>
                        <Row justify="space-between" align="center">
                            <label className={`app__options--label`}>Passphrase</label>
                            <span className={`app__options-text`}>{dataOptions.passphrase}</span>
                        </Row>
                        <Row justify="end">
                            <button
                                className={`app__options--btn`}
                                onClick={() => setModalOptionsVisible(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`app__options--btn`}
                                onClick={() => {
                                    handleOnReview(dataOptions)
                                    setModalReviewVisible(true)
                                }}
                            >
                                Preview
                            </button>
                        </Row>
                    </Col>
                </Row>
            </Modal>

            <Modal
                title="Preview Data"
                visible={isModalReviewVisible}
                footer={null}
                onCancel={() => {
                    setDataReview([])
                    setModalReviewVisible()
                }}
                width={1000}
                style={{ top: 15 }}
            >
                <Row>
                    <Col xs={24} className={''}>
                        <Row>{data.data && <span>{`10/ ${data.data.length}`}</span>}</Row>
                        <DataTable
                            highlightOnHover
                            columns={dataReview.columns}
                            data={dataReview.data}
                        />
                        <Row justify="end">
                            <button
                                className={`app__options--btn`}
                                onCancel={() => {
                                    setDataReview([])
                                    setModalReviewVisible()
                                }}
                            >
                                Cancel
                            </button>
                            {dataOptions.output === 'File' ? (
                                <CSVLink
                                    data={data.data}
                                    filename={'my-file.csv'}
                                    className={`app__options--btn`}
                                    target="_blank"
                                    onClick={() => handleAnonymize(dataOptions)}
                                >
                                    Confirm
                                </CSVLink>
                            ) : (
                                <button
                                    className={`app__options--btn`}
                                    onClick={() => handleAnonymize(dataOptions)}
                                >
                                    Confirm
                                </button>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Modal>
        </Row>
    )
}

export default Home

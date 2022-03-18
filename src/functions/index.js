import crypto from 'crypto-js'
const private_key = process.env.REACT_APP_PRIVATE_KEY

export const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/)
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/)

    const list = []
    for (let i = 1; i < dataStringLines.length; i++) {
        const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/)
        if (headers && row.length == headers.length) {
            const obj = {}
            for (let j = 0; j < headers.length; j++) {
                let d = row[j]
                if (d.length > 0) {
                    if (d[0] == '"') d = d.substring(1, d.length - 1)
                    if (d[d.length - 1] == '"') d = d.substring(d.length - 2, 1)
                }
                if (headers[j]) {
                    obj[headers[j]] = d
                }
            }

            // remove the blank rows
            if (Object.values(obj).filter((x) => x).length > 0) {
                list.push(obj)
            }
        }
    }

    // prepare columns list from headers
    const columns = headers.map((c) => ({
        name: c,
        selector: c,
    }))

    return { data: list, columns: columns }
}

export function anonymizeData(type, policy, data, key) {
    const response = [...data]

    switch (type) {
        case 'DES':
            response.map((val) => {
                let string = key
                policy.map((field) => {
                    const valueRandom = randomField(val[field.value], field.type)
                    string = string + valueRandom
                    val[field.value] = valueRandom
                })
                console.log(string)
                return (val['HASH'] = crypto.DES.encrypt(
                    JSON.stringify({ string }),
                    private_key
                ).toString())
            })
            break
        case 'TripleDES':
            response.map((val) => {
                let string = key

                policy.map((field) => {
                    const valueRandom = randomField(val[field.value], field.type)
                    string = string + valueRandom
                    val[field.value] = valueRandom
                })
                console.log(string)
                return (val['HASH'] = crypto.TripleDES.encrypt(
                    JSON.stringify({ string }),
                    private_key
                ).toString())
            })
            break
        case 'Rabbit':
            response.map((val) => {
                let string = key

                policy.map((field) => {
                    const valueRandom = randomField(val[field.value], field.type)
                    string = string + valueRandom
                    val[field.value] = valueRandom
                })
                console.log(string)
                return (val['HASH'] = crypto.Rabbit.encrypt(
                    JSON.stringify({ string }),
                    private_key
                ).toString())
            })
            break
        case 'RC4':
            response.map((val) => {
                let string = key

                policy.map((field) => {
                    const valueRandom = randomField(val[field.value], field.type)
                    string = string + valueRandom
                    val[field.value] = valueRandom
                })
                console.log(string)
                return (val['HASH'] = crypto.RC4.encrypt(
                    JSON.stringify({ string }),
                    private_key
                ).toString())
            })
            break
        default:
            response.map((val) => {
                let string = key

                policy.map((field) => {
                    const valueRandom = randomField(val[field.value], field.type)
                    string = string + valueRandom
                    val[field.value] = valueRandom
                })
                return (val['HASH'] = crypto.AES.encrypt(
                    JSON.stringify({ string }),
                    private_key
                ).toString())
            })
            break
    }

    return response
}

export function checkData(type, data, key) {
    let response = false

    switch (type) {
        case 'DES':
            data.map((val) => {
                const stringDecrypt = crypto.DES.decrypt(val.HASH.toString(), private_key).toString(
                    crypto.enc.Utf8
                )
                if (stringDecrypt.indexOf(key) !== -1) response = true
            })
            break
        case 'TripleDES':
            data.map((val) => {
                const stringDecrypt = crypto.TripleDES.decrypt(
                    val.HASH.toString(),
                    private_key
                ).toString(crypto.enc.Utf8)
                if (stringDecrypt.indexOf(key) !== -1) response = true
            })
            break
        case 'Rabbit':
            data.map((val) => {
                const stringDecrypt = crypto.Rabbit.decrypt(
                    val.HASH.toString(),
                    private_key
                ).toString(crypto.enc.Utf8)
                if (stringDecrypt.indexOf(key) !== -1) response = true
            })
            break
        case 'RC4':
            data.map((val) => {
                const stringDecrypt = crypto.RC4.decrypt(val.HASH.toString(), private_key).toString(
                    crypto.enc.Utf8
                )
                if (stringDecrypt.indexOf(key) !== -1) response = true
            })
            break
        default:
            data.map((val) => {
                const stringDecrypt = crypto.AES.decrypt(val.HASH.toString(), private_key).toString(
                    crypto.enc.Utf8
                )

                if (stringDecrypt.indexOf(key) !== -1) {
                    return (response = true)
                }
            })
            break
    }

    return response
}

export function randomField(string, type) {
    const charactersText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const charactersNumber = '0123456789'

    let result = ''
    if (type === 'text') {
        for (let i = 0; i < string.length; i++) {
            result += charactersText.charAt(Math.floor(Math.random() * charactersText.length))
        }
    } else {
        for (let i = 0; i < string.length; i++) {
            result += charactersNumber.charAt(Math.floor(Math.random() * charactersNumber.length))
        }
    }

    return result
}

export function handlePolicy(arrPolicy) {
    let arrResponse = []

    arrPolicy.map((val) => {
        let obj = { value: '', type: '' }
        obj.value = val.slice(0, val.indexOf('-') - 1)
        obj.type = val.slice(val.indexOf('-') + 2, val.length)
        return arrResponse.push(obj)
    })

    return arrResponse
}

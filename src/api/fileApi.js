import axiosClient from './axiosClient'

const fileApi = {
    postDataFile: (data) => {
        const url = `/file`
        return axiosClient.post(url, data)
    },
}
export default fileApi

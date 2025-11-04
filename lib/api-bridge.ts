import axios, {AxiosInstance, AxiosError} from "axios";
import { BASE_API_URL } from "@/../global";

const axiosInstance = axios.create({
    baseURL: BASE_API_URL
})

export const get = async (url: string, token: string) => {
    try {
        let headers: any = {
            "Authorization": `Bearer ${token}` || '',
        }
        let result = await axiosInstance.get(url, {
            headers
        })

        return{
            status: true,
            data: result.data
        }
    }catch (error) {
        const err = error as AxiosError<{message: string, code: number }>
        if (err.response) {
            console.log(err.response.data.message);
            return{
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong: ${error}`
        }
    }
}

export async function post(url: string, data: any, token?: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })
    return res.json()
  }


export const put = async (url: string, data: string | FormData, token: string) => {
    try {
        const type: string = (typeof data == 'string') ? "application/json" : "multipart/form-data"
        let result = await axiosInstance.put(url, data, {
            headers: {
                "Authorization": `Bearer ${token}` || '',
                "Content-Type": type
            }
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        const err = error as AxiosError<{ message: string, code: number }>
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const drop = async (url: string, token: string) => {
    try {
        let result = await axiosInstance.delete(url, {
            headers: {
                "Authorization": `Bearer ${token}` || '',
            }
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        const err = error as AxiosError<{ message: string, code: number }>
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}
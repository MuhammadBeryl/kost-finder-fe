import Cookie from "js-cookie";

export const storeCookies = (key: string, plainText: string) => {
    Cookie.set(key, plainText, { expires: 1})
}

export const getCookies = (key: string) => {
    return Cookie.get(key)
}

export const removeCookies= (key: string) => {
    Cookie.remove(key)
}
import Axios, { AxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

import { env } from '../env'

let logoutFn: null | (() => void) = null

export const setLogoutHandler = (fn: () => void) => {
	logoutFn = fn
}

let isLoggingOut = false

export const AXIOS_INSTANCE = Axios.create({
	baseURL: env.EXPO_PUBLIC_BACKEND,
})

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> => {
	const source = Axios.CancelToken.source()
	const promise = AXIOS_INSTANCE({
		...config,
		...options,
		cancelToken: source.token,
	}).then(({ data }) => data)

	// @ts-ignore
	promise.cancel = () => {
		source.cancel('Query was cancelled')
	}

	return promise
}

AXIOS_INSTANCE.interceptors.request.use(async (config) => {
	try {
		if (isLoggingOut) {
			return Promise.reject({ message: 'Request blocked: logging out' })
		}
		const accessToken = await SecureStore.getItemAsync('accessToken')
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`
		} else {
			// Sentry.withScope((scope) => {
			// 	scope.setTag('axios_interceptor', 'request')
			// 	scope.setExtra('url', config.url)
			// 	scope.setExtra('method', config.method)
			// 	scope.setExtra('baseURL', config.baseURL)
			// 	scope.setExtra('headers_before', config.headers)
			// 	Sentry.captureMessage('Axios request sem token de acesso')
			// })
		}
		return config

	} catch (error) {
		return Promise.reject(error)
	}
})

AXIOS_INSTANCE.interceptors.response.use(
	(response) => response,
	async (error) => {
		const config = error.config
		const status = error.response?.status
		const url = config?.url
		const method = config?.method?.toUpperCase()
		const errorMessage = error.response?.data?.message || error.message

		console.error('[AXIOS ERROR]', {
			method,
			url,
			status,
			errorMessage,
			timestamp: new Date().toISOString(),
		})

		if (status === 401 && !isLoggingOut) {
			isLoggingOut = true
			await logoutFn?.()
			setTimeout(() => {
				isLoggingOut = false
			}, 2000)
		}

		if (error.response?.data?.message) {
			const erro = new Error(error.response.data.message) as Error & {
				code?: string
				status?: number
			}
			erro.code = error.response.data.code
			erro.status = status
			throw erro
		} else {
			return Promise.reject(error)
		}
	},
)

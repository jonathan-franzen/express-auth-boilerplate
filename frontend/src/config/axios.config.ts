import { BACKEND_URL } from '@/constants/environment.constants';
import axios, { AxiosInstance } from 'axios';

export const axiosPublic: AxiosInstance = axios.create({
	baseURL: BACKEND_URL,
	headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate: AxiosInstance = axios.create({
	baseURL: BACKEND_URL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json', 'Accept-Encoding': '*' },
});

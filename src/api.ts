import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse, AxiosInstance } from 'axios';

interface IConstructor {
  url: string;
  timeout?: number;
}

export default class Api {
  client: AxiosInstance;
  constructor({ url, timeout = 10 * 1000 }: IConstructor) {
    this.client = axios.create({
      baseURL: url,
      timeout,
    });
  }
}

import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse, AxiosInstance } from 'axios';

interface IConstructor {
  url: string;
  apiKey: string;
  timeout?: number;
}

interface IRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
}

export default class VoucheryIO {
  client: AxiosInstance;
  constructor({ url, apiKey, timeout = 10 * 1000 }: IConstructor) {
    this.client = axios.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout,
    });
  }

  private async apiRequest({ url, method, data }: IRequest): Promise<any> {
    let request: AxiosResponse;
    try {
      request = await this.client.request(
        method === 'GET'
          ? {
              url,
              method,
            }
          : {
              url,
              method,
              data,
            },
      );
    } catch (error) {
      let errorMsg: string;
      if (error.response) {
        errorMsg = JSON.stringify({
          status: error.response.status,
          headers: error.response.headers,
          message: error.response.data ? JSON.stringify(error.response.data) : null,
        });
      } else if (error.request) {
        errorMsg = JSON.stringify({
          status: 998,
          headers: error.request.headers,
          message: 'Cannot Send Request',
        });
      } else {
        errorMsg = JSON.stringify({
          status: 999,
          headers: null,
          message: 'Unexpected error',
        });
      }

      throw new Error(errorMsg);
    }

    return request.data;
  }

  createCampaign() {}

  updateCampaign() {}

  deleteCampaign() {}

  getCampaign() {}

  allRewardsInCampaign() {}

  createReward() {}

  updateReward() {}

  deleteReward() {}

  allVouchersInCampaign() {}

  createVoucher() {}

  deleteVoucher() {}

  getVoucher() {}

  createRedemption() {}

  confirmRedemption() {}

  getRedemption() {}
}

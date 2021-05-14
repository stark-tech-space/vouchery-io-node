import axios, { AxiosResponse, AxiosInstance } from 'axios';

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

export enum CampaignType {
  MAIN = 'MainCampaign',
  SUB = 'SubCampaign',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum SubCampaignTriggerOn {
  CUSTOMER_POINTS_CHANGE = 'customer_points_change',
  REDEMPTION = 'redemption',
  CUSTOM = 'custom',
}

export enum MainCampaignTemplate {
  DISCOUNT = 'discount',
  LOYALTY = 'loyalty',
  GIFT_CARD = 'gift_card',
}

export enum SubCampaignTemplate {
  SUB_REDEMPTION = 'sub_redemption',
  SUB_REWARD_POINTS = 'sub_reward_points',
  SUB_GENERATE_VOUCHERS = 'sub_generate_vouchers',
}

export enum VoucherType {
  UNIQUE = 'unique',
  GENERIC = 'generic',
}

export enum VoucherCodeType {
  DIGITS = 'digits',
  LETTERS = 'letters',
  MIXED = 'mixed',
}

export enum RewardActionType {
  SET_DISCOUNT = 'setDiscount',
  GENERATE_PRODUCT_ITEM = 'generateProductItem',
}

export enum RewardDiscountType {
  NUMERIC = 'numeric',
  PERCENTAGE = 'percentage',
}

export enum VoucherStatus {
  CREATED = 'created',
  DISTRIBUTED = 'distributed',
  VALIDATED = 'validated',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ACTIVE = 'active',
}

export type UpdatedInfo = {
  name: string;
  email: string;
};

export type CreateMainCampaignRequest = {
  type: CampaignType;
  name: string;
  status?: CampaignStatus;
  template?: MainCampaignTemplate;
  description?: string;
  maxTotalBudget?: number;
  maxRedemptions?: number;
  team?: string;
  budgetCode?: string;
  createdBy?: UpdatedInfo;
  updatedBy?: UpdatedInfo;
};

export type CreateMainCampaignResponse = CreateMainCampaignRequest & {
  id: number;
  createAt: string;
  updatedAt: string;
};

export type CreateSubCampaignRequest = {
  type: CampaignType;
  parentId: number;
  name: string;
  status?: CampaignStatus;
  triggersOn?: SubCampaignTriggerOn;
  triggerName?: string;
  template?: SubCampaignTemplate;
  description?: string;
  customerInformation?: string;
  maxTotalBudget?: number;
  maxRedemptions?: number;
  minimumValue?: number;
  maxDiscount?: number;
  channel?: string;
  purpose?: string;
  voucherType?: VoucherType;
  voucherMaxRedemptions?: number;
  voucherCodeType?: VoucherCodeType;
  voucherRandomPartLength?: number;
  voucherPrefix?: string;
  createdBy?: UpdatedInfo;
  updatedBy?: UpdatedInfo;
};

export type CreateSubCampaignResponse = CreateSubCampaignRequest & {
  id: number;
  redemptionsCount: number;
  totalBudgetSpent: number;
  vouchersDistributedCount: number;
  vouchersCount: number;
  currency: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCampaignRequest = {
  id: number;
} & (CreateMainCampaignRequest | CreateSubCampaignRequest);

export type UpdateCampaignResponse = CreateMainCampaignResponse & CreateSubCampaignResponse;

export type DeleteCampaignRequest = {
  id: number;
};

export type QueryCampaignRequest = {
  id: number;
};

export type QueryCampaignResponse = CreateMainCampaignResponse & CreateSubCampaignResponse;

export type QueryAllRewardsACampaign = {
  campaignId: number;
};

export type RewardSetDiscountRequest = {
  title?: string;
  description?: string;
  discountType: RewardDiscountType;
  discountValue: number;
};

export type RewardGiftRequest = {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  productIdentifier?: string;
};

export type RewardRequest = { campaignId: number } & (RewardSetDiscountRequest | RewardGiftRequest);

export type RewardUpdateRequest = { id: number } & (RewardSetDiscountRequest | RewardGiftRequest);

export type RewardDeleteRequest = { id: number };

export type RewardResponse = {
  id: number;
  type: RewardActionType;
  title: string;
  description: string;
  campaignId: number;
  createdAt: string;
  updatedAt: string;
};

export type QueryAllVouchersACampaign = {
  campaignId: number;
};

export type CreateVoucherRequest = {
  campaignId: number;
  active: boolean;
  status?: VoucherStatus;
  code: string;
  customerIdentifier?: string;
};

export type VoucherResponse = {
  type: string;
  campaignId: number;
  active: boolean;
  status: VoucherStatus;
  code: string;
  customerIdentifier: string;
  createdAt: string;
  updatedAt: string;
};

export type Voucher = {
  code: string;
};

export type DeleteVoucherRequest = {
  code: string;
};

export type GetVoucherRequest = {
  code: string;
};

export type CreateRedemptionRequest = {
  code: string;
  transactionId: string;
  totalTransactionCost: number;
  customerIdentifier?: string;
  ttl?: number;
  userAgent?: string;
  confirmed: boolean;
};

export type RedemptionResponse = {
  type: string;
  transactionId: string;
  customerIdentifier: string;
  totalTransactionCose: number;
  ttl: number;
  grantedDiscount: number;
  valueLeft: number;
  userAgent: string;
  voucher: {
    code: string;
  };
  confirmed: boolean;
};

export type ConfirmRedemptionRequest = Voucher & {
  transactionId: string;
};

export type GetRedemptionRequest = Voucher & {
  transactionId: string;
};

const turnCamelCaseIntoUnderLine = (input: { [key: string]: any }): { [key: string]: any } => {
  const output = Object.entries(input).reduce((acc: { [key: string]: any }, [key, value]) => {
    //turn camelCase to camel_case
    const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[newKey] = value;
    return acc;
  }, {});
  return output;
};

const turnUnderLineToCamelCase = (input: { [key: string]: any }): { [key: string]: any } => {
  const output = Object.entries(input).reduce((acc: { [key: string]: any }, [key, value]) => {
    const processKey = key
      .split('_')
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
      .join('');
    const newKey = processKey.charAt(0).toLowerCase() + processKey.slice(1);
    acc[newKey] = value;
    return acc;
  }, {});
  return output;
};

export default class VoucheryIO {
  client: AxiosInstance;
  constructor({ url, apiKey, timeout = 10 * 1000 }: IConstructor) {
    console.log('apiKey', apiKey);
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
        method === 'GET' || method === 'DELETE'
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
    return turnUnderLineToCamelCase(request.data);
  }

  async getAllCampaign() {
    return this.apiRequest({
      url: '/campaigns',
      method: 'GET',
      data: null,
    });
  }

  async createMainCampaign(
    request: CreateMainCampaignRequest,
  ): Promise<CreateMainCampaignResponse> {
    const requestBody = turnCamelCaseIntoUnderLine(request);
    return this.apiRequest({
      url: '/campaigns',
      method: 'POST',
      data: requestBody,
    });
  }

  async createSubCampaign(request: CreateSubCampaignRequest): Promise<CreateSubCampaignResponse> {
    const requestBody = turnCamelCaseIntoUnderLine(request);
    return this.apiRequest({
      url: '/campaigns',
      method: 'POST',
      data: requestBody,
    });
  }

  async updateCampaign(request: UpdateCampaignRequest): Promise<UpdateCampaignResponse> {
    const { id, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/campaigns/${id}`,
      method: 'PATCH',
      data: requestBody,
    });
  }

  async deleteCampaign({ id }: DeleteCampaignRequest): Promise<{}> {
    return this.apiRequest({
      url: `/campaigns/${id}`,
      method: 'DELETE',
      data: {},
    });
  }

  async getCampaign({ id }: QueryCampaignRequest): Promise<QueryCampaignResponse> {
    return this.apiRequest({
      url: `/campaigns/${id}`,
      method: 'GET',
      data: {},
    });
  }

  async allRewardsInCampaign({ campaignId }: QueryAllRewardsACampaign): Promise<RewardResponse[]> {
    return this.apiRequest({
      url: `/campaigns/${campaignId}/rewards`,
      method: 'GET',
      data: {},
    });
  }

  async createReward(request: RewardRequest): Promise<RewardResponse> {
    const { campaignId, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/campaigns/${campaignId}/rewards`,
      method: 'POST',
      data: requestBody,
    });
  }

  async updateReward(request: RewardUpdateRequest): Promise<RewardResponse> {
    const { id, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/rewards/${id}`,
      method: 'PATCH',
      data: requestBody,
    });
  }

  async deleteReward({ id }: RewardDeleteRequest): Promise<{}> {
    return this.apiRequest({
      url: `/rewards/${id}`,
      method: 'DELETE',
      data: {},
    });
  }

  async allVouchersInCampaign({
    campaignId,
  }: QueryAllVouchersACampaign): Promise<VoucherResponse[]> {
    return this.apiRequest({
      url: `/campaigns/${campaignId}/vouchers`,
      method: 'GET',
      data: {},
    });
  }

  async createVoucher(request: CreateVoucherRequest): Promise<VoucherResponse> {
    const { campaignId, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/campaigns/${campaignId}/vouchers`,
      method: 'POST',
      data: requestBody,
    });
  }

  async deleteVoucher({ code }: DeleteVoucherRequest): Promise<{}> {
    return this.apiRequest({
      url: `/vouchers/${code}`,
      method: 'DELETE',
      data: {},
    });
  }

  async getVoucher({ code }: GetVoucherRequest) {
    return this.apiRequest({
      url: `/vouchers/${code}`,
      method: 'GET',
      data: {},
    });
  }

  async createRedemption(request: CreateRedemptionRequest): Promise<RedemptionResponse> {
    const { code, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/vouchers/${code}/redemptions`,
      method: 'POST',
      data: requestBody,
    });
  }

  async confirmRedemption(request: ConfirmRedemptionRequest): Promise<RedemptionResponse> {
    const { code, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/vouchers/${code}/redemptions`,
      method: 'PATCH',
      data: requestBody,
    });
  }

  async getRedemption(request: GetRedemptionRequest): Promise<RedemptionResponse> {
    const { code, ...restRequest } = request;
    const requestBody = turnCamelCaseIntoUnderLine(restRequest);
    return this.apiRequest({
      url: `/vouchers/${code}/redemptions`,
      method: 'GET',
      data: requestBody,
    });
  }
}

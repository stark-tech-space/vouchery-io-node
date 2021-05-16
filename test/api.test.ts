import dotenv from 'dotenv';
dotenv.config();

import VoucheryIO, {
  CampaignType,
  CreateMainCampaignRequest,
  MainCampaignTemplate,
  CampaignStatus,
  UpdateCampaignRequest,
  CreateSubCampaignRequest,
  SubCampaignTriggerOn,
  SubCampaignTemplate,
} from '../src/api';

import * as crypto from 'crypto';

const voucheryIO = new VoucheryIO({
  url: process.env.VOUCHERY_IO_BASE_URL || '',
  apiKey: process.env.VOUCHERY_IO_API_KEY || '',
});

describe('vouchery test', () => {
  describe('test main campaign', () => {
    afterAll(async () => {
      const allCampaigns = await voucheryIO.getAllCampaign();

      const campaigns: any = Object.values(allCampaigns);
      for (const campaign of campaigns) {
        const children = campaign.children;
        for (const subCampaign of children) {
          const rewards = await voucheryIO.allRewardsInCampaign({
            campaignId: subCampaign.id,
          });
          await Promise.all(
            Object.values(rewards).map((reward) => voucheryIO.deleteReward({ id: reward.id })),
          );

          // wait 1 second
          await new Promise<null>((resolve, reject) => {
            setTimeout(() => {
              resolve(null);
            }, 1 * 1000);
          });

          await voucheryIO.deleteCampaign({ id: subCampaign.id });

          // wait 1 second
          await new Promise<null>((resolve, reject) => {
            setTimeout(() => {
              resolve(null);
            }, 1 * 1000);
          });
        }
        await voucheryIO.deleteCampaign({ id: campaign.id });

        // wait 1 second
        await new Promise<null>((resolve, reject) => {
          setTimeout(() => {
            resolve(null);
          }, 1 * 1000);
        });
      }
    });

    it('should create a new main campaign', async () => {
      const newCreateMainCampaign: CreateMainCampaignRequest = {
        name: `campaignName-${crypto.randomInt(1000)}`,
        type: CampaignType.MAIN,
        template: MainCampaignTemplate.DISCOUNT,
        status: CampaignStatus.ACTIVE,
      };
      const response = await voucheryIO.createMainCampaign(newCreateMainCampaign);

      expect(response).toHaveProperty('id');
    });

    it('should update a main campaign', async () => {
      const newCreateMainCampaign: CreateMainCampaignRequest = {
        name: `campaignUpdateName-${crypto.randomInt(1000)}`,
        type: CampaignType.MAIN,
        template: MainCampaignTemplate.DISCOUNT,
        status: CampaignStatus.ACTIVE,
      };
      const createResponse = await voucheryIO.createMainCampaign(newCreateMainCampaign);

      expect(createResponse).toHaveProperty('id');
      expect(createResponse.type).toBe(CampaignType.MAIN);
      expect(createResponse.status).toBe(CampaignStatus.ACTIVE);
      expect(createResponse.template).toBe(MainCampaignTemplate.DISCOUNT);

      let updateCampaign: UpdateCampaignRequest = {
        id: createResponse.id,
        type: createResponse.type,
        name: createResponse.name,
        template: MainCampaignTemplate.GIFT_CARD,
        status: CampaignStatus.INACTIVE,
      };

      const updateResponse = await voucheryIO.updateCampaign(updateCampaign);

      expect(updateResponse).toHaveProperty('id');
      expect(updateResponse.type).toBe(CampaignType.MAIN);
      expect(updateResponse.status).toBe(CampaignStatus.INACTIVE);
      expect(updateResponse.template).toBe(MainCampaignTemplate.GIFT_CARD);
    });

    it('should delete a main campaign', async () => {
      const newCreateMainCampaign: CreateMainCampaignRequest = {
        name: `campaignDeleteName--${crypto.randomInt(1000)}`,
        type: CampaignType.MAIN,
        template: MainCampaignTemplate.DISCOUNT,
        status: CampaignStatus.ACTIVE,
      };
      const createResponse = await voucheryIO.createMainCampaign(newCreateMainCampaign);

      expect(createResponse).toHaveProperty('id');
      expect(createResponse.type).toBe(CampaignType.MAIN);

      const deleteResponse = await voucheryIO.deleteCampaign({ id: createResponse.id });
    });

    it('should get correct campaign', async () => {
      const newCreateMainCampaign: CreateMainCampaignRequest = {
        name: `campaignQueryName-${crypto.randomInt(1000)}`,
        type: CampaignType.MAIN,
        template: MainCampaignTemplate.DISCOUNT,
        status: CampaignStatus.ACTIVE,
      };
      const mainCreateResponse = await voucheryIO.createMainCampaign(newCreateMainCampaign);

      expect(mainCreateResponse).toHaveProperty('id');
      expect(mainCreateResponse.type).toBe(CampaignType.MAIN);

      const getMainResponse = await voucheryIO.getCampaign({ id: mainCreateResponse.id });

      expect(getMainResponse).toHaveProperty('id');
      expect(getMainResponse.id).toBe(mainCreateResponse.id);
      expect(getMainResponse.type).toBe(CampaignType.MAIN);
      expect(getMainResponse.template).toBe(MainCampaignTemplate.DISCOUNT);
      expect(getMainResponse.status).toBe(CampaignStatus.ACTIVE);
    });
  });

  describe('test sub campaign', () => {
    const newCreateMainCampaign: CreateMainCampaignRequest = {
      name: `campaignMainName-${crypto.randomInt(1000)}`,
      type: CampaignType.MAIN,
      template: MainCampaignTemplate.DISCOUNT,
      status: CampaignStatus.ACTIVE,
    };

    let newCreateSubCampaign: CreateSubCampaignRequest = {
      type: CampaignType.SUB,
      name: `subCampaignName-${crypto.randomInt(1000)}`,
      triggersOn: SubCampaignTriggerOn.REDEMPTION,
      triggerName: `subCampaignTrigger-${crypto.randomInt(1000)}`,
      template: SubCampaignTemplate.SUB_REDEMPTION,
      status: CampaignStatus.ACTIVE,
      parentId: -1,
      maxRedemptions: 10,
    };
    let mainCampaignId: number;
    let subCampaignId: number;

    beforeAll(async () => {
      const response = await voucheryIO.createMainCampaign(newCreateMainCampaign);
      mainCampaignId = response.id;
      newCreateSubCampaign.parentId = mainCampaignId;
    });

    afterAll(async () => {
      const allCampaigns = await voucheryIO.getAllCampaign();

      const campaigns: any = Object.values(allCampaigns);
      for (const campaign of campaigns) {
        const children = campaign.children;
        for (const subCampaign of children) {
          const rewards = await voucheryIO.allRewardsInCampaign({
            campaignId: subCampaign.id,
          });
          await Promise.all(rewards.map((reward) => voucheryIO.deleteReward({ id: reward.id })));

          // wait 1 second
          await new Promise<null>((resolve, reject) => {
            setTimeout(() => {
              resolve(null);
            }, 1 * 1000);
          });

          await voucheryIO.deleteCampaign({ id: subCampaign.id });

          // wait 1 second
          await new Promise<null>((resolve, reject) => {
            setTimeout(() => {
              resolve(null);
            }, 1 * 1000);
          });
        }
        await voucheryIO.deleteCampaign({ id: campaign.id });

        // wait 1 second
        await new Promise<null>((resolve, reject) => {
          setTimeout(() => {
            resolve(null);
          }, 1 * 1000);
        });
      }
    });

    it('should create a new sub campaign', async () => {
      const subCreateResponse = await voucheryIO.createSubCampaign(newCreateSubCampaign);

      expect(subCreateResponse).toHaveProperty('id');
      expect(subCreateResponse.type).toBe(CampaignType.SUB);
      expect(subCreateResponse.parentId).toBe(mainCampaignId);
      expect(subCreateResponse.maxRedemptions).toBe(10);
      subCampaignId = subCreateResponse.id;
    });

    it('should get correct sub campaign', async () => {
      const getSubResponse = await voucheryIO.getCampaign({ id: subCampaignId });

      expect(getSubResponse).toHaveProperty('id');
      expect(getSubResponse.id).toBe(subCampaignId);
      expect(getSubResponse.type).toBe(CampaignType.SUB);
      expect(getSubResponse.parentId).toBe(newCreateSubCampaign.parentId);
      expect(getSubResponse.maxRedemptions).toBe(10);
    });

    it('should update a sub campaign', async () => {
      const updatedSubCampaign: UpdateCampaignRequest = {
        type: CampaignType.SUB,
        id: subCampaignId,
        parentId: mainCampaignId,
        name: newCreateSubCampaign.name,
        maxRedemptions: 20,
      };

      const updatedResponse = await voucheryIO.updateCampaign(updatedSubCampaign);

      expect(updatedResponse).toHaveProperty('id');
      expect(updatedResponse.type).toBe(CampaignType.SUB);
      expect(updatedResponse.parentId).toBe(newCreateSubCampaign.parentId);
      expect(updatedResponse.maxRedemptions).toBe(20);
    });

    it('should delete sub campaign', async () => {
      const deleteSubResponse = await voucheryIO.deleteCampaign({ id: subCampaignId });
    });
  });

  describe('test reward', () => {
    test('should works', () => {
      expect(true).toBeTruthy();
    });
  });
});

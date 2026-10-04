import { BaseRepository } from '../BaseRepository';
import type { Advertisement } from '../../types/advertisement';

export type { Advertisement };

export class AdvertisementRepository extends BaseRepository<Advertisement> {
  constructor() {
    super('advertisements');
  }

  protected getConverter(): any {
    return {};
  }

  public async createAdvertisement(ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'impressionsCount' | 'clicksCount'> & { impressionsCount?: number; clicksCount?: number }): Promise<string> {
    return this.create({
      ...ad,
      impressionsCount: ad.impressionsCount || 0,
      clicksCount: ad.clicksCount || 0,
    });
  }

  public async recordImpression(adId: string): Promise<void> {
    try {
      await fetch(`/api/advertisements/${adId}/view`, { method: 'POST' });
    } catch (err) {
      console.warn(`[AdvertisementRepository] Failed to record impression for ${adId}:`, err);
    }
  }

  public async recordClick(adId: string): Promise<void> {
    try {
      await fetch(`/api/advertisements/${adId}/click`, { method: 'POST' });
    } catch (err) {
      console.warn(`[AdvertisementRepository] Failed to record click for ${adId}:`, err);
    }
  }

  public async updateStatus(adId: string, status: Advertisement['status']): Promise<void> {
    await this.update(adId, {
      status,
    } as any);
  }
}

export const advertisementRepository = new AdvertisementRepository();

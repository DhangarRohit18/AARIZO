import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Advertisement } from '../../types/advertisement';

export type { Advertisement };

export class AdvertisementRepository extends BaseRepository<Advertisement> {
  constructor() {
    super('advertisements');
  }

  protected getConverter(): FirestoreDataConverter<Advertisement> {
    return {
      toFirestore(ad: Advertisement): any {
        const { id, ...data } = ad;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Advertisement {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || 'soc-gvs',
          title: data.title || '',
          tagline: data.tagline || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          targetRole: data.targetRole,
          targetAudience: data.targetAudience || 'ALL',
          actionLabel: data.actionLabel || data.ctaText || 'Learn More',
          actionUrl: data.actionUrl || data.ctaLink || '#',
          discountCode: data.discountCode,
          startAt: data.startAt || new Date().toISOString(),
          endAt: data.endAt || new Date(Date.now() + 30 * 86400000).toISOString(),
          priority: typeof data.priority === 'number' ? data.priority : 5,
          frequency: data.frequency || 'ONCE_PER_DAY',
          status: data.status || 'ACTIVE',
          createdBy: data.createdBy || 'ADMIN',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          impressionsCount: data.impressionsCount || data.viewsCount || 0,
          clicksCount: data.clicksCount || 0,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
        };
      },
    };
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
      await updateDoc(this.getDocRef(adId) as any, {
        impressionsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn(`[AdvertisementRepository] Failed to record impression for ${adId}:`, err);
    }
  }

  public async recordClick(adId: string): Promise<void> {
    try {
      await updateDoc(this.getDocRef(adId) as any, {
        clicksCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn(`[AdvertisementRepository] Failed to record click for ${adId}:`, err);
    }
  }

  public async updateStatus(adId: string, status: Advertisement['status']): Promise<void> {
    await this.update(adId, { status });
  }
}

export const advertisementRepository = new AdvertisementRepository();

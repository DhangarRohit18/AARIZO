export interface SocietyScopedEntity {
  societyId: string;
  [key: string]: any;
}

export function filterBySociety<T extends SocietyScopedEntity>(
  items: T[],
  currentSocietyId?: string,
  userRole?: string
): T[] {
  // Super Admins can see all data across societies if no filter specified
  if (userRole === 'SUPER_ADMIN' && (!currentSocietyId || currentSocietyId === 'ALL')) {
    return items;
  }
  
  const targetSocietyId = currentSocietyId || 'soc-gvs'; // Fallback to active society
  return items.filter((item) => item.societyId === targetSocietyId);
}

export function enforceSocietyContext<T extends SocietyScopedEntity>(
  data: T,
  currentSocietyId: string
): T {
  return {
    ...data,
    societyId: data.societyId || currentSocietyId,
  };
}

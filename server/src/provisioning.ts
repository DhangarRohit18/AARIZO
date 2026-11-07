import crypto from 'crypto';
import { prisma } from './prisma.js';

export interface ProvisionSocietyInput {
  societyName: string;
  registrationDetails?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  towersCount?: number;
  flatsCount?: number;
  secretaryName: string;
  secretaryEmail: string;
  secretaryPhone: string;
  secretaryPassword?: string;
  creatorId?: string;
}

export interface ProvisionUserInput {
  societyId: string;
  role: 'resident' | 'guard' | 'secretary' | 'committee' | 'facility_manager' | 'vendor' | 'admin';
  name: string;
  email: string;
  phone: string;
  password?: string;
  flatNumber?: string;
  towerId?: string;
  flatId?: string;
  creatorId?: string;
  metadata?: Record<string, any>;
}

export interface ProvisionResult {
  success: boolean;
  message: string;
  userId?: string;
  societyId?: string;
  role?: string;
  temporaryPassword?: string;
  details?: Record<string, any>;
}

/**
 * Universal Provisioning Service for SafeGate 2.0
 * Handles atomic, multi-entity creation across PostgreSQL with transactional audit records.
 */
export class UniversalProvisioningService {
  /**
   * Generates a cryptographically secure 12-character temporary password
   */
  public static generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    const bytes = crypto.randomBytes(12);
    for (let i = 0; i < 12; i++) {
      pass += chars[bytes[i] % chars.length];
    }
    return pass;
  }

  /**
   * Hashes a password using SHA-256 with a unique salt
   */
  public static hashPassword(password: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  /**
   * Provision a Society and automatically provision the primary Secretary
   */
  public static async provisionSociety(input: ProvisionSocietyInput): Promise<ProvisionResult> {
    const {
      societyName,
      registrationDetails,
      address,
      city,
      state,
      pincode,
      towersCount = 1,
      flatsCount = 10,
      secretaryName,
      secretaryEmail,
      secretaryPhone,
      secretaryPassword = this.generateSecurePassword(),
      creatorId = 'admin-system',
    } = input;

    // 1. Validation
    if (!societyName?.trim()) throw new Error('Society name is required.');
    if (!secretaryEmail?.trim() || !secretaryEmail.includes('@')) throw new Error('Valid secretary email is required.');
    if (!secretaryPhone?.trim()) throw new Error('Valid secretary phone number is required.');

    // 2. Duplicate checks
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: secretaryEmail.toLowerCase().trim() }, { phone: secretaryPhone.trim() }],
      },
    });

    if (existingUser) {
      throw new Error(`A user with email ${secretaryEmail} or phone ${secretaryPhone} already exists.`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(secretaryPassword, salt);
    const eventId = `evt_${crypto.randomUUID()}`;

    // 3. Atomic Multi-Entity Provisioning
    const result = await prisma.$transaction(async (tx) => {
      // Create Society
      const society = await tx.society.create({
        data: {
          name: societyName.trim(),
          code: `SOC-${Date.now().toString(36).toUpperCase()}`,
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          totalTowers: towersCount,
          totalFlats: flatsCount,
        },
      });

      // Create Initial Tower
      const tower = await tx.tower.create({
        data: {
          societyId: society.id,
          name: 'Tower A',
          blockCode: 'A',
          totalFloors: Math.ceil(flatsCount / 4),
          totalUnits: flatsCount,
        },
      });

      // Create Initial Flat
      const flat = await tx.flat.create({
        data: {
          societyId: society.id,
          towerId: tower.id,
          flatNumber: 'A-101',
          floorNumber: 1,
          bhkType: 'BHK_2',
          occupancyStatus: 'OWNER_OCCUPIED',
        },
      });

      // Create Secretary User
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          email: secretaryEmail.toLowerCase().trim(),
          phone: secretaryPhone.trim(),
          name: secretaryName.trim(),
          role: 'secretary',
          societyId: society.id,
          flatId: flat.id,
          flatNumber: 'A-101',
          status: 'ACTIVE',
        },
      });

      // Create Society Membership
      await tx.societyMembership.create({
        data: {
          societyId: society.id,
          userId: user.id,
          role: 'secretary',
          status: 'ACTIVE',
        },
      });

      // Create Secretary Resident Profile
      await tx.resident.create({
        data: {
          societyId: society.id,
          userId: user.id,
          flatId: flat.id,
          name: secretaryName.trim(),
          email: secretaryEmail.toLowerCase().trim(),
          phone: secretaryPhone.trim(),
          residentType: 'OWNER',
          status: 'ACTIVE',
        },
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          societyId: society.id,
          actorId: user.id,
          actorName: user.name,
          role: 'secretary',
          action: 'SOCIETY_AND_SECRETARY_PROVISIONED',
          entityName: 'SOCIETY',
          entityId: society.id,
          metadata: {
            societyName: society.name,
            secretaryName: user.name,
            secretaryEmail: user.email,
            creatorId,
          },
        },
      });

      // Record Durable Outbox Event
      await tx.outboxEvent.create({
        data: {
          eventId,
          societyId: society.id,
          eventType: 'SOCIETY_PROVISIONED',
          entityId: society.id,
          actorId: creatorId,
          payload: {
            societyId: society.id,
            societyName: society.name,
            secretaryId: user.id,
            secretaryEmail: user.email,
          },
          status: 'PENDING',
        },
      });

      return { society, user, tower };
    });

    return {
      success: true,
      message: `Society "${result.society.name}" and Secretary account provisioned successfully.`,
      societyId: result.society.id,
      userId: result.user.id,
      role: 'secretary',
      temporaryPassword: secretaryPassword,
      details: {
        societyName: result.society.name,
        secretaryEmail: result.user.email,
        towerName: result.tower.name,
      },
    };
  }

  /**
   * Provision any user under a society (Resident, Guard, Committee, Facility Manager, Vendor)
   */
  public static async provisionUser(input: ProvisionUserInput): Promise<ProvisionResult> {
    const {
      societyId,
      role,
      name,
      email,
      phone,
      password = this.generateSecurePassword(),
      flatNumber = 'A-101',
      towerId,
      flatId,
      creatorId = 'system',
      metadata = {},
    } = input;

    // 1. Validation
    if (!societyId) throw new Error('Society ID is required.');
    if (!name?.trim()) throw new Error('User name is required.');
    if (!email?.trim() || !email.includes('@')) throw new Error('Valid email address is required.');
    if (!phone?.trim()) throw new Error('Valid phone number is required.');

    // 2. Verify Society Exists
    const society = await prisma.society.findUnique({ where: { id: societyId } });
    if (!society) throw new Error(`Society with ID ${societyId} does not exist.`);

    // 3. Duplicate checks
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      throw new Error(`A user with email ${email} or phone ${phone} already exists.`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);
    const eventId = `evt_${crypto.randomUUID()}`;

    // 4. Atomic Transaction for Role-Specific Provisioning
    const result = await prisma.$transaction(async (tx) => {
      // Find or create flat for resident
      let targetFlatId = flatId;
      if (!targetFlatId) {
        const existingFlat = await tx.flat.findFirst({
          where: { societyId },
        });
        if (existingFlat) {
          targetFlatId = existingFlat.id;
        } else {
          // create default tower and flat
          const newTower = await tx.tower.create({
            data: {
              societyId,
              name: 'Tower A',
              blockCode: 'A',
            },
          });
          const newFlat = await tx.flat.create({
            data: {
              societyId,
              towerId: newTower.id,
              flatNumber: flatNumber.trim(),
              floorNumber: 1,
            },
          });
          targetFlatId = newFlat.id;
        }
      }

      // Create Core User Profile
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          societyId,
          flatId: targetFlatId,
          flatNumber: flatNumber.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: role,
          status: 'ACTIVE',
        },
      });

      // Create Society Membership
      await tx.societyMembership.create({
        data: {
          societyId,
          userId: user.id,
          role,
          status: 'ACTIVE',
        },
      });

      // Role-Specific Profile Creation
      if (role === 'resident' || role === 'committee') {
        await tx.resident.create({
          data: {
            societyId,
            userId: user.id,
            flatId: targetFlatId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            residentType: role === 'committee' ? 'OWNER' : 'TENANT',
            status: 'ACTIVE',
          },
        });
      } else if (role === 'guard' || role === 'facility_manager') {
        await tx.staff.create({
          data: {
            societyId,
            userId: user.id,
            name: name.trim(),
            roleCategory: role === 'guard' ? 'GUARD' : 'FACILITY_MANAGER',
            phone: phone.trim(),
            status: 'ACTIVE',
          },
        });
      } else if (role === 'vendor') {
        await tx.vendor.create({
          data: {
            societyId,
            userId: user.id,
            businessName: name.trim(),
            contactPerson: name.trim(),
            serviceType: metadata.category || 'GENERAL_MAINTENANCE',
            phone: phone.trim(),
            email: email.toLowerCase().trim(),
            status: 'ACTIVE',
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          societyId,
          actorId: user.id,
          actorName: user.name,
          role,
          action: `USER_PROVISIONED_${role.toUpperCase()}`,
          entityName: 'USER',
          entityId: user.id,
          metadata: {
            name: user.name,
            email: user.email,
            role,
            flatNumber,
            creatorId,
          },
        },
      });

      // Outbox Event for Real-Time Dispatch
      await tx.outboxEvent.create({
        data: {
          eventId,
          societyId,
          eventType: 'USER_PROVISIONED',
          entityId: user.id,
          actorId: creatorId,
          payload: {
            userId: user.id,
            societyId,
            role,
            name: user.name,
            email: user.email,
            flatNumber,
          },
          status: 'PENDING',
        },
      });

      return user;
    });

    return {
      success: true,
      message: `${role.toUpperCase()} account for "${result.name}" provisioned successfully.`,
      userId: result.id,
      societyId,
      role,
      temporaryPassword: password,
      details: {
        name: result.name,
        email: result.email,
        phone: result.phone,
        flatNumber,
      },
    };
  }
}

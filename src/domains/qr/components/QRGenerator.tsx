import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { qrService } from '../services/QRService';
import type { QREntityType } from '../types/index';

interface QRGeneratorProps {
  entityType: QREntityType;
  entityId: string;
  societyId: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeLogo?: boolean;
}

/**
 * QRGenerator creates a secure QR Code payload and renders it using SVG.
 * The payload is an opaque token, never containing PII.
 */
export const QRGenerator: React.FC<QRGeneratorProps> = ({
  entityType,
  entityId,
  societyId,
  size = 200,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  level = 'M',
  includeLogo = true
}) => {
  // Generate the secure payload dynamically
  const payloadStr = qrService.createQRPayload(entityType, entityId, societyId);

  return (
    <div style={{ padding: '1rem', background: bgColor, borderRadius: '1rem', display: 'inline-block' }}>
      <QRCodeSVG
        value={payloadStr}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level={level}
        imageSettings={includeLogo ? {
          src: '/favicon.svg', // Assuming there's a communityOS logo
          x: undefined,
          y: undefined,
          height: size * 0.2,
          width: size * 0.2,
          excavate: true,
        } : undefined}
      />
    </div>
  );
};




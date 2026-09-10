import React, { useState } from 'react';
import type { ResidentProfileDetails } from '../../../domains/profile';
import { Avatar, Modal, Button, Input, Toast } from '../../common';
import { User, Building, Phone, Mail, Shield, Car, ArrowLeft, Edit3 } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface ProfileHomeProps {
  onBackToMore: () => void;
}

export const ProfileHome: React.FC<ProfileHomeProps> = ({ onBackToMore }) => {
  const [profile, setProfile] = useState<ResidentProfileDetails>({
    fullName: 'Sarvesh Kulkarni',
    email: 'sarvesh.kulkarni@example.com',
    phone: '+91 98765 43210',
    societyName: 'Lakeview Residency',
    tower: 'Tower B',
    flatNumber: 'Flat 1204',
    occupancyType: 'Owner',
    moveInDate: '15 Jan 2024',
    emergencyContactName: 'Aarti Kulkarni (Spouse)',
    emergencyContactPhone: '+91 98765 99999',
    vehiclesCount: 2,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.fullName);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      fullName: editName,
      phone: editPhone,
      email: editEmail,
    });
    setIsEditModalOpen(false);
    setToastMsg('Profile details updated');
  };

  return (
    <div className="res-profile-container">
      {toastMsg && <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />}

      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBackToMore} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">My Profile</h2>
          <p className="vis-screen-subtitle">Resident identity & household details</p>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="res-profile-hero-card">
        <div className="res-hero-top">
          <Avatar name={profile.fullName} size="lg" status="online" />
          <div className="res-hero-info">
            <h3 className="res-hero-name">{profile.fullName}</h3>
            <span className="res-hero-role">{profile.occupancyType} • Resident</span>
            <span className="res-hero-flat">{profile.tower} · {profile.flatNumber}</span>
          </div>
        </div>

        <button
          className="res-edit-profile-btn"
          onClick={() => {
            setEditName(profile.fullName);
            setEditPhone(profile.phone);
            setEditEmail(profile.email);
            setIsEditModalOpen(true);
          }}
        >
          <Edit3 size={14} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Residence Information */}
      <section className="res-profile-section">
        <h3 className="res-section-heading">Residence Information</h3>
        <div className="res-info-grid">
          <div className="res-info-row">
            <Building size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Society Name</span>
              <span className="info-val">{profile.societyName}</span>
            </div>
          </div>

          <div className="res-info-row">
            <User size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Flat & Tower</span>
              <span className="info-val">{profile.tower} · {profile.flatNumber} ({profile.occupancyType})</span>
            </div>
          </div>

          <div className="res-info-row">
            <Car size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Registered Vehicles</span>
              <span className="info-val">{profile.vehiclesCount} Vehicles (Slot B-12)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Emergency Details */}
      <section className="res-profile-section">
        <h3 className="res-section-heading">Contact & Emergency Details</h3>
        <div className="res-info-grid">
          <div className="res-info-row">
            <Phone size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Primary Phone</span>
              <span className="info-val">{profile.phone}</span>
            </div>
          </div>

          <div className="res-info-row">
            <Mail size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Email Address</span>
              <span className="info-val">{profile.email}</span>
            </div>
          </div>

          <div className="res-info-row">
            <Shield size={16} className="info-ic" />
            <div>
              <span className="info-lbl">Personal Emergency Contact</span>
              <span className="info-val">{profile.emergencyContactName} ({profile.emergencyContactPhone})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="res-modal-form">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Phone Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />
          <Input
            label="Email Address"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

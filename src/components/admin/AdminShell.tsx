import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  Megaphone,
  Boxes,
  Sparkles,
  Search,
  Bell,
  Building,
} from 'lucide-react';
import { Badge, Avatar, LoadingState, EmptyState, ErrorState } from '../common';
import './admin.css';

export const AdminShell: React.FC = () => {
  const { adminNav, setAdminNav, uiState } = usePrototype();

  const renderContent = () => {
    if (uiState === 'loading') {
      return <LoadingState message="Fetching society operations metrics & directory..." />;
    }
    if (uiState === 'empty') {
      return (
        <EmptyState
          title="No Administrative Records Found"
          description="There are currently no active audit logs, pending helpdesk tickets, or defaulter records."
        />
      );
    }
    if (uiState === 'error') {
      return (
        <ErrorState
          title="Society Service Unreachable"
          message="Simulated connection error between Admin Dashboard and NestJS Monolith Service."
          onRetry={() => {}}
        />
      );
    }

    switch (adminNav) {
      case 'dashboard':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Executive Operations Overview</h2>
              <p>Real-time occupancy rate, today's gate traffic count, open SLA tickets, and pending maintenance dues.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Includes interactive metric cards, gate activity trend graphs, and high-priority escalation queues.</p>
            </div>
          </div>
        );
      case 'society':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Society & Multi-Tenant Management</h2>
              <p>Manage Towers, Floors, Flats, Residents (Owners vs Tenants), Staff, and Roles & Permissions matrix.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Visual flat occupancy matrix, resident onboarding approval queue, and staff RBAC configuration table.</p>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Gate & Visitor Audit Logs</h2>
              <p>Comprehensive gate entry/exit inspection logs, security officer shift rosters, and blacklist manager.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Filterable audit table with date range pickers, visitor photo inspector, and gate supervisor logs.</p>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Financial Operations & Billing</h2>
              <p>Bulk maintenance bill generator wizard preview, defaulter trackers, and payment collection ledgers.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Automated payment reminder dispatcher and downloadable collection ledger reports.</p>
            </div>
          </div>
        );
      case 'helpdesk':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Helpdesk & SLA Management</h2>
              <p>Kanban ticket board by status (New, In Progress, Escalated, Closed) with staff assignment and SLA timers.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Ticket resolution timeline tracker, technician assignment drawers, and resident satisfaction ratings.</p>
            </div>
          </div>
        );
      case 'announcements':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="primary">MVP ROADMAP</Badge>
              <h2>Announcements & Broadcast Publisher</h2>
              <p>Rich notice publisher with category tags (Urgent, Event, Maintenance) and emergency SMS/Push alert composer.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>Phase 2 Implementation Target</h4>
              <p>Audience segment target selector (All Blocks, Specific Block, Owners Only, Tenants Only).</p>
            </div>
          </div>
        );
      case 'v1-modules':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="warning">V1 ROADMAP PREVIEW</Badge>
              <h2>V1 Modules (Amenities, Directory, Analytics)</h2>
              <p>Amenity slot pricing & rule configurator, society directory moderation, and advanced analytics.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>V1 Roadmap Preview</h4>
              <p>Management dashboard for clubhouse slot approvals, amenity maintenance blockouts, and analytics.</p>
            </div>
          </div>
        );
      case 'v2-preview':
        return (
          <div className="shell-placeholder-content">
            <div className="placeholder-hero">
              <Badge variant="info">V2 ROADMAP PREVIEW</Badge>
              <h2>V2 Modules Preview (Marketplace, Property, Services, AI)</h2>
              <p>Marketplace moderation, property listing approvals, vendor services setup, and AI document RAG manager.</p>
            </div>
            <div className="placeholder-info-box">
              <h4>V2 Roadmap Preview</h4>
              <p>Representative UI shells for upcoming society marketplace, resale listings, and AI knowledge search.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-web-container">
      {/* Persistent Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Building className="brand-icon" size={22} />
          <div>
            <div className="brand-name">CommunityOS</div>
            <div className="brand-tagline">Admin Web Console</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Core Operations</div>
          <button
            className={`sidebar-nav-item ${adminNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setAdminNav('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'society' ? 'active' : ''}`}
            onClick={() => setAdminNav('society')}
          >
            <Building2 size={18} />
            <span>Society Management</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'audit' ? 'active' : ''}`}
            onClick={() => setAdminNav('audit')}
          >
            <ShieldCheck size={18} />
            <span>Gate & Visitor Audit</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'finance' ? 'active' : ''}`}
            onClick={() => setAdminNav('finance')}
          >
            <CreditCard size={18} />
            <span>Financial Operations</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'helpdesk' ? 'active' : ''}`}
            onClick={() => setAdminNav('helpdesk')}
          >
            <LifeBuoy size={18} />
            <span>Helpdesk & SLA</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'announcements' ? 'active' : ''}`}
            onClick={() => setAdminNav('announcements')}
          >
            <Megaphone size={18} />
            <span>Announcements</span>
            <span className="nav-badge-mvp">MVP</span>
          </button>

          <div className="nav-section-title">Roadmap Previews</div>
          <button
            className={`sidebar-nav-item ${adminNav === 'v1-modules' ? 'active' : ''}`}
            onClick={() => setAdminNav('v1-modules')}
          >
            <Boxes size={18} />
            <span>V1 Modules</span>
            <span className="nav-badge-v1">V1</span>
          </button>
          <button
            className={`sidebar-nav-item ${adminNav === 'v2-preview' ? 'active' : ''}`}
            onClick={() => setAdminNav('v2-preview')}
          >
            <Sparkles size={18} />
            <span>V2 Modules Preview</span>
            <span className="nav-badge-v2">V2</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="tenant-info">
            <span className="tenant-label">ACTIVE TENANT</span>
            <span className="tenant-name">Greenfield Heights RWA</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <div className="admin-body">
        {/* Top Header Placeholder */}
        <header className="admin-header">
          <div className="admin-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search flats, residents, visitor passes, or tickets..."
              className="admin-search-input"
            />
          </div>
          <div className="admin-header-actions">
            <button className="admin-icon-btn" aria-label="Alerts">
              <Bell size={18} />
            </button>
            <div className="admin-profile-chip">
              <Avatar name="Sarah Jenkins" size="sm" status="online" />
              <div>
                <div className="profile-name">Sarah Jenkins</div>
                <div className="profile-role">Estate Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="admin-main-content">{renderContent()}</main>
      </div>
    </div>
  );
};

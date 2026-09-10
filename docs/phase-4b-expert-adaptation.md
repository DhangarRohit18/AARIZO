# CommunityOS — Phase 4B Expert Reference Adaptation Matrix

This document evaluates the 9 expert industry reference images under `references/industry-feedback/` against the original **CommunityOS Web Demo Architecture**.

The core principle governing Phase 4B:
> **CommunityOS Web Demo Features & Information Architecture + Expert-Preferred UX Patterns = Premium Native Mobile Experience**

No expert reference image is permitted to delete or replace existing core CommunityOS features.

---

## 🎨 Expert Reference Evaluation & Decision Matrix

| Reference File | Target Web Demo Area | Expert Design Pattern | CommunityOS Adaptation | Decision | Adaptation Rationale |
|---|---|---|---|---|---|
| `login.png` | Auth / Login Screen | Clean mobile login with role selector dropdown, country code (+91), and bottom cityscape graphic. | CommunityOS interactive role selector cards (`RoleSelectorScreen`) with test OTP modal and dark slate background. | **Adopt with Modification** | Our interactive role selector cards provide a more intuitive multi-role prototype switcher than a standard select dropdown. |
| `notifications.png` | Notifications Hub | Top category filter pills (`All`, `Complaint`, `General`), status icons, timestamp tags, dismiss actions. | Resident `NotificationsScreen` with filter pills (`All`, `Gate Pass`, `Payments`, `Community`, `Safety`), unread status dots, and deep-link action buttons. | **Adopt 1:1** | Directly enhances notifications scannability without removing action routes. |
| `onboarding-01.png` | Onboarding Step 1 | Soft blue gradient background, 3D community graphic, headline, description, progress indicators, `Skip` button. | `OnboardingScreen` 3-step carousel featuring soft blue gradient, page dots, and `Get Started` CTA. | **Adopt 1:1** | Establishes a warm, modern platform entry experience. |
| `onboarding-02.png` | Onboarding Step 2 | Family & security feature illustration with clean typography and progress indicator. | Step 2 of `OnboardingScreen` focusing on family management and security alerts. | **Adopt 1:1** | Preserves 3-step onboarding value proposition. |
| `onboarding-03.png` | Onboarding Step 3 | Gate security & digital pass mobile graphic highlighting real-time gate access. | Step 3 of `OnboardingScreen` focusing on digital gate passes. | **Adopt 1:1** | Highlights signature gate pass security feature. |
| `residents.png` | Directory & Resident List | Search bar, wing filter pills (`All Wings`, `Wing A`, `Wing B`), resident status badges (`CURRENTLY_RESIDING`), flat numbers, floor tags. | Secretary directory view and resident contact lists with status badges while strictly enforcing Guard privacy isolation. | **Adopt with Modification** | Provides clean directory filtering while maintaining strict Guard privacy boundaries. |
| `secretary-home.png` | Dashboard & Quick Actions | Greeting header, date widget, announcement card, 6-grid quick action launcher icons, recent activity timeline. | Resident and Guard dashboards feature 6-grid quick action launchers, announcement banner, and real-time movement feed. | **Adopt 1:1** | Excellent grid architecture for high-frequency resident and guard quick actions. |
| `secretary-profile.png.jpeg` | Profile & Account | Large avatar circle, verified role badge (`Secretary`), itemized profile details, stat cards, managing committee roster. | `ResidentProfileScreen` displaying verified resident badge, society info, vehicle tags, family roster, and household staff. | **Adopt with Modification** | Provides clean structured card hierarchy while masking sensitive staff passcodes (`PASS-••••`). |
| `society-home.png` | Resident Home Portal | Property dropdown, announcement banner, 6-grid quick actions, community updates feed, bottom navigation shell. | Core backbone layout for `HomeScreen` featuring dues card, active pass card, quick action grid, and notice feed. | **Adopt 1:1** | Core layout backbone for Resident Home Shell. |

---

## 🛡️ Feature Preservation & Integrity Rules

1. **Information Architecture Integrity**:
   - The Resident Home screen MUST preserve: Property Header, Contextual Alert Banner, Active Visitor Pass status card, 6-Grid Quick Actions, Announcements feed, and Upcoming Activity / Dues snapshot.
2. **Guard Terminal Operational Identity**:
   - The Guard Shell MUST maintain its high-contrast slate-dark terminal presentation (`#0F172A` / `#1E293B`), Gate #1 OPEN/CLOSED toggle, 4-digit keypad passcode terminal, 2-step entry approval modal, and dedicated Resident SOS Alert Center.
3. **Privacy Boundary Protection**:
   - Guard UI MUST NEVER expose resident email, phone number, family roster, vehicle tags, household staff, or private profile settings.
4. **Safety Simulation Disclaimers**:
   - Emergency SOS workflows MUST display explicit prototype disclaimers (`"RESIDENT SOS SIMULATION ACTIVE"`, `"Panic SOS workflow triggered — pending gate acknowledgment"`).

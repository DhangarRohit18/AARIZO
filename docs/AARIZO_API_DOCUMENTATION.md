# AARIZO 2.0: REST API SPECIFICATION

## 1. Authentication & Security Headers
All protected routes require an Authorization Bearer token:
`Authorization: Bearer <Firebase_ID_Token>`

---

## 2. Endpoints Inventory

### Universal Provisioning
* `POST /api/admin/provision-society`: Provisions a society and its primary secretary.
* `POST /api/secretary/provision-user`: Provisions residents, guards, committee members, facility managers, or vendors.

### Real-time Outbox & SSE
* `GET /api/realtime/stream`: Connects to authenticated SSE event stream with auto-reconnection and `Last-Event-ID` replay.
* `POST /api/realtime/broadcast`: Ingests events into the transactional outbox and dispatches to connected clients.

### Financial & Razorpay
* `POST /api/payments/razorpay/create-order`: Calculates balance server-side and creates a Razorpay order in paise.
* `POST /api/payments/razorpay/verify`: Validates HMAC SHA-256 signature using constant-time verification and settles invoice.
* `POST /api/payments/razorpay/refund`: Initiates refund with server authorization.
* `POST /api/payments/razorpay/webhook`: Validates webhook signature and updates transaction status idempotently.

### Advanced CommunityOS Differentiators
* `GET /api/trust-score/:entityType/:entityId`: Fetches 0-100 explainable trust score.
* `GET /api/wallet/balance/:residentId`: Retrieves ledger wallet balance.
* `POST /api/wallet/transaction`: Atomically credits or debits wallet with balance invariant validation.
* `GET /api/marketplace/federated-vendors`: Discovers verified vendors across federated societies.
* `POST /api/ai/governance-check`: Asserts AI advisory constraints and blocks autonomous critical actions.

### Facility & Operations
* `GET /api/work-orders` & `POST /api/work-orders`: Work order management and SLA tracking.
* `GET /api/attendance` & `POST /api/attendance/check-in`: Guard & staff attendance tracking.
* `GET /api/compliance-documents` & `POST /api/compliance-documents`: Digital vault for society NOCs and audits.
* `GET /api/move-requests` & `POST /api/move-requests`: Moving scheduling, elevator reservation, and gate pass generation.

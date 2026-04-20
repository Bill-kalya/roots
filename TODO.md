🏗️ THE GUY — PRODUCTION DATABASE BLUEPRINT

This is not “basic schema.”
This is designed for scale, trust, and control.

🧩 1. USERS TABLE (All humans)
users
- id (UUID)
- full_name
- phone_number (unique)
- email
- password_hash
- role (CUSTOMER, PROVIDER, ADMIN)
- is_verified (boolean)
- created_at
🧑‍🔧 2. PROVIDERS TABLE (Extended profile)
providers
- id (UUID)
- user_id (FK → users)
- bio
- profile_image_url
- verification_level (NONE, BASIC, ID_VERIFIED, BUSINESS)
- is_online (boolean)
- last_active_at

-- performance stats
- rating_avg
- total_reviews
- jobs_completed
- jobs_cancelled
- response_rate
- repeat_clients_percentage

👉 This is your trust engine core

🛠️ 3. SERVICES TABLE
services
- id (UUID)
- provider_id (FK → providers)
- category (PLUMBING, ELECTRICAL, DESIGN, etc.)
- title
- description
- pricing_type (FIXED, HOURLY, NEGOTIABLE)
- base_price
- is_active
📍 4. PROVIDER_LOCATIONS (REAL-TIME POSITIONING)
provider_locations
- id
- provider_id
- latitude
- longitude
- updated_at

👉 Needed for:

Nearby matching
Heatmaps later
📦 5. JOBS TABLE (Core of everything)
jobs
- id (UUID)
- customer_id (FK → users)
- provider_id (FK → providers)

- service_category
- description

- status (REQUESTED, MATCHING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)

- urgency (INSTANT, SCHEDULED)
- scheduled_time

- price_estimate
- final_price

- latitude
- longitude

- created_at
- accepted_at
- completed_at
⭐ 6. REVIEWS TABLE (STRICT SYSTEM)
reviews
- id
- job_id (FK → jobs)
- customer_id
- provider_id

- rating_quality
- rating_reliability
- rating_communication

- comment

- created_at

👉 Rating is derived, not just stored blindly

💰 7. PAYMENTS TABLE
payments
- id
- job_id
- customer_id
- provider_id

- amount
- status (PENDING, HELD, RELEASED, REFUNDED)

- payment_method (MPESA, CARD)

- transaction_reference
- created_at
🧠 8. MATCHING_LOGS (YOUR SECRET WEAPON)
matching_logs
- id
- job_id
- provider_id

- match_score
- distance_score
- reputation_score
- price_score
- availability_score

- was_selected (boolean)
- created_at

👉 This is GOLD:

Debug matching
Improve algorithm
Train AI later
🔔 9. JOB_REQUESTS (DISPATCH SYSTEM)
job_requests
- id
- job_id
- provider_id

- status (PENDING, ACCEPTED, REJECTED, EXPIRED)
- sent_at
- responded_at

👉 Controls:

Who got the job
Who ignored it
💬 10. MESSAGES (Chat system)
messages
- id
- job_id
- sender_id
- message
- created_at
⚙️ MATCHING ENGINE (HOW IT WORKS)

Now the brain 🧠

STEP 1: FILTER

When job comes in:

Same category
Within radius (e.g. 5–10km)
Available providers (online OR eligible offline)
STEP 2: SCORE

Each provider gets a score:

Distance (closer = higher)
Rating
Completion rate
Response rate
Price fairness
STEP 3: SELECT TOP
Take top 3–5 providers
STEP 4: DISPATCH (ADAPTIVE)
⚡ If URGENT:
Send to 3 providers simultaneously
First accept wins
🧠 If NORMAL:
Send one by one
Wait → fallback
STEP 5: LOCK
First accept → job assigned
Others auto-expire
🔁 PROVIDER MODE (HYBRID LOGIC)
🟢 Online Mode
Gets instant jobs
Real-time matching
🟡 Offline Mode
Still receives:
Scheduled jobs
Bids (later feature)
🛡️ CONTROL RULES (CRITICAL)

If provider:

Ignores requests → ↓ ranking
Cancels jobs → heavy penalty
Gets bad reviews → hidden

👉 System self-regulates

🚀 WHAT YOU JUST BUILT (Mentally)

Not an app.

You now have:

A matching engine
A trust system
A payment system
A logistics layer

👉 This is literally:

Uber + marketplace + reputation system combined
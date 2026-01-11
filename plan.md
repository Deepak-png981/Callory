# Focus Contacts – V1 App Plan (Android)
## Permissionless Contact Picker Edition

---

## Product Goal (V1)
A **one-tap Focus mode** that:
- Enables **Do Not Disturb (Priority)** mode
- Allows calls **only from user-selected important people**
- Keeps everything else silent
- Avoids reading the full contact list (Play Store friendly)

Target user: Professionals and students who want to stay focused without missing critical calls.

---

## Key Constraints & Design Decisions
- **No READ_CONTACTS permission in V1**
- Contacts are selected using the **Android system contact picker**
- Android DND reliably allows calls from:
  - Starred contacts
  - Repeat callers (optional)
- App temporarily uses **Starred contacts** to implement allow-list behavior
- Required permission:
  - **Notification Policy Access (DND)**

---

# Screen & Flow Plan (V1)

## 0. Splash / Boot
**Purpose:** Decide routing.
- First launch → Onboarding
- Returning user → Home

---

## 1. Onboarding (3–4 screens)

### Screen 1: Value Proposition
- “Mute distractions. Never miss important calls.”
- CTA: **Get started**

### Screen 2: How Contact Selection Works
- “You’ll pick people using Android’s contact picker.”
- “We never read your full contact list.”

### Screen 3: DND Access Explanation
- “To let important calls ring, Focus needs Do Not Disturb access.”
- CTA: **Enable DND access**
- Skip allowed → Home will show a warning

### Screen 4: Setup Complete
- “You’re ready to focus.”
- CTA: **Go to Home**

---

## 2. Home (Main Control Screen)

### Sections
1. **Focus Toggle**
   - OFF / ON
   - ON state text:
     - “Only allowed contacts can ring”
   - If DND access missing:
     - Toggle opens Setup screen instead

2. **Allowed Contacts Summary**
   - “Allowed contacts: 0 / 3” (V1 limit)
   - Small avatar chips if available
   - CTA: **Manage allowed contacts**

3. **Status Indicators**
   - DND access: ✅ Granted / ❗ Not granted
   - Focus state: Active / Inactive
   - Optional: Repeat callers ON/OFF

4. **Footer**
   - Settings icon

---

## 3. Allowed Contacts Screen

**Purpose:** Manage who can bypass Focus mode.

### Layout
- Title: **Allowed Contacts**
- Subtitle: “These people can call you during Focus mode”
- List of allowed contacts:
  - Name
  - Phone number
  - Remove button
- Primary CTA: **+ Add contact**
- Secondary CTA: **Clear all**

### Add Contact Flow
1. User taps **+ Add contact**
2. Android **system contact picker** opens
3. User selects a contact
4. If multiple numbers:
   - Show number selection modal
5. Contact is added to allowed list

### Rules
- V1 cap (recommended): 3–5 contacts
- Prevent duplicate numbers
- No contact permission required

### Empty State
- “No allowed contacts yet”
- CTA: **Add contact**

---

## 4. Setup / Permissions Screen (DND Only)

**Purpose:** Handle missing or revoked DND access.

### Card: Do Not Disturb Access
- Status: Granted / Not granted
- Button: **Open DND settings**
- Instruction:
  - “Enable ‘Allow notification policy access’ for Focus Contacts”
- On return:
  - App rechecks and updates status immediately

---

## 5. Settings Screen (Minimal – V1)

### Options
- **Restore starred contacts on Focus OFF** (default ON)
- **Allow repeat callers** (optional toggle)
- Help / FAQ
- Contact support (email)

---

# Core UX & Behavior Decisions

## Contact Handling Strategy (V1)
- App does **not** read the full contacts database
- Contacts are added **one-by-one** via system picker
- Only minimal data is stored locally

---

## Focus Mode – System Behavior

### When Focus Mode is Turned ON
1. Verify DND access
   - If missing → redirect to Setup screen
2. If no allowed contacts:
   - Block activation
   - Show: “Add at least one allowed contact”
3. Save current system state:
   - Current DND mode
   - Current starred contacts
4. Apply Focus state:
   - Star allowed contacts (temporary)
   - Enable DND (Priority only)
   - Allow calls from starred contacts
   - Enable repeat callers if selected

---

### When Focus Mode is Turned OFF
1. Restore previously starred contacts (if enabled)
2. Restore previous DND state (best effort)
3. Mark Focus as OFF

---

# Data Storage (Minimal & Local Only)

### Allowed Contact
- `displayName`
- `phoneNumber` (normalized)
- Optional: `contactUri` or `lookupKey`
- `createdAt`

### App State
- `focusEnabled`
- `restoreStarsEnabled`
- `repeatCallersEnabled`
- `starSnapshot` (pre-Focus starred contacts)

**No contact data leaves the device.**

---

# Edge Cases to Handle (V1 Quality Bar)
- Contact deleted or number changed
- Duplicate numbers added
- User revokes DND access while Focus is ON
- Device reboot while Focus is active
- OEM-specific DND behavior differences

---

# Explicit Non-Goals for V1
- Full searchable contacts list
- SMS / messaging app filtering
- App notification whitelisting
- Scheduling or automation
- Multiple profiles
- Productivity analytics

---

# Suggested V1 Milestones
1. UI skeleton (Home + Allowed Contacts)
2. Permissionless contact picker flow
3. DND access handling
4. Focus ON/OFF end-to-end behavior
5. Restore starred contacts logic
6. OEM testing & polish

---

## V1 Success Criteria
- No READ_CONTACTS permission requested
- User setup completed in under **2 minutes**
- Focus mode reliably allows only allowed callers
- System state fully restored after Focus OFF
- Clear, transparent UX around permissions and behavior

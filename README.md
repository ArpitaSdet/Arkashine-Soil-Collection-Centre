# 🌱 Arkashine-Soil-Collection-Centre

> Dashboard for managing Arkashine soil samples, batch bag consignments, 5-point chain of custody transit tracking, laboratory diagnostics, and farmer advisories.

---

## 🚀 Quick Start

1. **Option A (Double-Click Launcher):**
   - Double-click `start_dashboard.bat` to automatically launch the dashboard in your default web browser.

2. **Option B (Node.js Server):**
   ```bash
   node server.js
   ```
   Open `http://localhost:8000` in any web browser.
   (On local Wi-Fi / mobile: `http://192.168.29.3:8000`)

3. **Option C (Direct Browser Open):**
   - Open `index.html` directly in Google Chrome, Microsoft Edge, Firefox, or Safari.

---

## 🎯 Key Capabilities & Workflow Coverage

### 1. 🧭 Chain of Custody: 5-Point Transit Tracking Pipeline
Just like a registered speed-post consignment, every soil sample travels through 5 verifiable checkpoints:
1. **1. ORIGIN (Village Partner)**: Farmer intake & batch consignment assignment.
2. **2. TRANSIT (Logistics Runner)**: Runner custody (name, mobile, pickup time, destination lab).
3. **3. LABORATORY (Machine Chemist)**: Laboratory diagnostic testing & dual-personnel verification.
4. **4. CERTIFICATION (Digital Health Card)**: Official digital soil test certificate with scannable barcode and QR code.
5. **5. ADVISORY (Farmer & Source)**: Final advisory delivered to the farmer and collection partner.

### 2. 🎒 Soil Consignment & Batch Monitoring
- Post-office style bag hierarchy: 1 Bag = Configurable sample capacity.
- Direct on-page controls to add batches, increase number of bags, and set bag capacity.
- Real-time indicator of tested vs pending samples per bag.

### 3. 👤 Registered Farmers Directory
- Clean, unique farmer profiles without duplication.
- Click any farmer to expand their complete sample history, runner tracking, lab destination, and test status.
- Edit farmer name and phone number across all linked samples.

### 4. 🌾 Central Soil Consignment Ledger
- Real-time sample table showing Tracking ID, Farmer, Handed By, Runner Transit, Destination Lab, Status & Chemist.
- Actions: 1-click status toggle (Tested / Pending), Edit ticket, Delete ticket, WhatsApp dispatch, Print certificate.

### 5. 🧪 Testing Centres & Fleet Breakdown
- Summary of tests performed across Arkashine Central Diagnostic Lab and remote field testing machines.

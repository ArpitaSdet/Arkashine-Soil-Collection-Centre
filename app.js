// Arkashine Soil Collection Centre Tracking & Operations Dashboard v4.1
// Complete 5-Step Workflow with Custody Chain, Unique Farmer Profiles & Advisory

const PRESET_VILLAGES = [
  "Harohalli", "Bidadi", "Nelamangala", "Kunigal", "Magadi",
  "Channapatna", "Ramanagara", "Maddur", "Mandya", "Malavalli",
  "Kanakapura", "Tavarekere", "Devanahalli", "Doddaballapura", "Hosakote",
  "Anekal", "Kengeri", "Jigani", "Attibele", "Sarjapura",
  "Vijayapura", "Solur", "Kudur", "Maralawadi", "Kailancha",
  "Uyyamballi", "Satanur", "Kasaba", "Halagur", "Koppa",
  "Bellur", "Nagamangala", "Pandavapura", "Srirangapatna", "Krishnarajpet",
  "Gubbi", "Tumkur", "Sira", "Tiptur", "Turuvekere"
];

const PARTNER_CATEGORIES = [
  "Village Soil Partner",
  "Retail Soil Partner",
  "All Registered Soil Collection Partners",
  "Others"
];

const INITIAL_DATA = {
  villages: [...PRESET_VILLAGES],
  shops: [
    { id: "SHP-101", shopName: "Harohalli Village Soil Partner Centre", shopkeeper: "Manjunath Gowda", phone: "9845011223", category: "Village Soil Partner", village: "Harohalli", address: "Main Road, Harohalli Bus Stand", samplesCollected: 0 },
    { id: "SHP-102", shopName: "Bidadi Retail Soil Partner", shopkeeper: "Suresh Reddy", phone: "9845022334", category: "Retail Soil Partner", village: "Bidadi", address: "Station Road, Bidadi Circle", samplesCollected: 0 },
    { id: "SHP-103", shopName: "Ramanagara Central Soil Collection Hub", shopkeeper: "Kiran Kumar", phone: "9845033445", category: "All Registered Soil Collection Partners", village: "Ramanagara", address: "APMC Yard, Ramanagara", samplesCollected: 0 }
  ],
  testingCentres: [
    { id: "TC-CENTRAL", name: "Arkashine Central Diagnostic Lab", type: "Arkashine Central Lab", machineSerial: "ARK-CENTRAL-LAB-01", operatorName: "Dr. Vignesh Shastry (Chief Analyst)", operatorPhone: "9880011223", location: "Bengaluru Central Diagnostic Hub", dateDeployed: "2026-01-10", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-101", name: "Field Unit 1 - Ramanagara Machine Station", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M04", operatorName: "Anand Murthy (Field Chemist)", operatorPhone: "9880022334", location: "APMC Complex, Ramanagara", dateDeployed: "2026-03-15", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-102", name: "Field Unit 2 - Mandya Mobile Testing Centre", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M09", operatorName: "Pooja Hegde (Testing Executive)", operatorPhone: "9880033445", location: "Near Sugar Factory Circle, Mandya", dateDeployed: "2026-05-20", status: "Active", totalTestsCount: 0 }
  ],
  farmers: [],
  soilSamples: []
};

class ArkashineApp {
  constructor() {
    // Auto-clear prior demo data from browser storage
    try {
      ["ARKASHINE_DASHBOARD_DATA_V1", "ARKASHINE_DASHBOARD_DATA_V2", "ARKASHINE_DASHBOARD_DATA_V3", "ARKASHINE_DASHBOARD_DATA_V4", "ARKASHINE_DASHBOARD_DATA_V4_1"].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    this.storageKey = "ARKASHINE_DASHBOARD_DATA_CLEAN_V1";
    this.data = this.loadData();
    this.activeStep = 1; // 1: Register/Batch, 2: Pickup, 3: Testing, 4: Certificate, 5: Advisory
    this.activeTicket = null;
    this.searchQuery = "";
    this.statusFilter = "All";
    this.totalBagsBatchOption = 10;
    this.samplesPerBagCapacityOption = 10;
    this.expandedFarmerId = null;
    this.editingFarmerId = null;
    this.activeScannedCode = "ARK-IND-89201"; // Default displayed report
    this.isCameraActive = false;
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.villages) parsed.villages = [...PRESET_VILLAGES];
        if (parsed.soilSamples) {
          parsed.soilSamples.forEach(s => {
            if (s.advisorySent === undefined) s.advisorySent = false;
            if (!s.advisorySentTo) s.advisorySentTo = "";
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load stored data, fallback to initial demo:", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error("Could not save to localStorage:", e);
    }
  }

  clearAllData() {
    if (confirm("Are you sure you want to delete ALL data? All registered farmers and soil samples will be permanently cleared.")) {
      this.data.farmers = [];
      this.data.soilSamples = [];
      this.data.testingCentres.forEach(tc => tc.totalTestsCount = 0);
      this.data.shops.forEach(s => s.samplesCollected = 0);
      this.activeTicket = null;
      this.activeStep = 1;
      this.saveData();
      this.render();
      alert("✅ All data has been completely wiped from the backend storage!");
    }
  }

  resetToDemo() {
    this.clearAllData();
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "arkashine_backup_" + new Date().toISOString().slice(0, 10) + ".json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }

  generateTrackingId() {
    return "ARK-IND-" + Math.floor(10000 + Math.random() * 90000);
  }

  startNewFarmerFlow() {
    this.activeStep = 1;
    this.activeTicket = null;
    this.render();
    setTimeout(() => {
      document.getElementById("flow-farmer-name")?.focus();
    }, 120);
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  loadExistingTicket(trackingId, stepToOpen = null) {
    const sample = this.data.soilSamples.find(s => s.trackingId === trackingId);
    if (!sample) return;
    this.activeTicket = sample;

    if (stepToOpen) {
      this.activeStep = stepToOpen;
    } else {
      if (sample.advisorySent) {
        this.activeStep = 5;
      } else if (sample.isTested) {
        this.activeStep = 4;
      } else if (sample.pickedByRunner && sample.pickedByRunner.trim() !== "") {
        this.activeStep = 3;
      } else {
        this.activeStep = 2;
      }
    }

    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleSampleTestStatus(trackingId) {
    const sample = this.data.soilSamples.find(s => s.trackingId === trackingId);
    if (!sample) return;

    sample.isTested = !sample.isTested;
    if (sample.isTested) {
      sample.status = sample.advisorySent ? "Advisory Sent" : "Tested";
      sample.testedAt = new Date().toLocaleString('sv-SE').slice(0, 16);
      if (sample.destinationCentreId) {
        const tc = this.data.testingCentres.find(c => c.id === sample.destinationCentreId);
        if (tc) tc.totalTestsCount = (tc.totalTestsCount || 0) + 1;
      }
    } else {
      sample.status = "Pending";
      sample.testedAt = null;
    }

    this.saveData();
    this.render();
  }

  // ─── STEP 1 SUBMIT (Register or Edit Farmer & Assign to Bag) ───────────
  handleStep1Submit() {
    const channel = document.querySelector('input[name="flow_farmer_channel"]:checked')?.value || "Village Soil Partner";
    const name = document.getElementById("flow-farmer-name")?.value?.trim();
    const phone = document.getElementById("flow-farmer-phone")?.value?.trim();

    if (!name) {
      alert("Please enter the farmer's full name.");
      document.getElementById("flow-farmer-name")?.focus();
      return;
    }
    if (!phone || phone.length !== 10 || isNaN(phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      document.getElementById("flow-farmer-phone")?.focus();
      return;
    }

    let village = document.getElementById("flow-farmer-village")?.value?.trim() || "Harohalli";
    if (village === "__ADD_NEW__") {
      const inlineVillage = document.getElementById("flow-new-village-input")?.value?.trim();
      if (inlineVillage) {
        village = inlineVillage;
        if (!this.data.villages.includes(village)) this.data.villages.push(village);
      } else {
        village = "Harohalli";
      }
    }

    const collectedBy = document.getElementById("flow-sample-collected-by")?.value?.trim() || "Village Partner Owner";
    const bagNum = parseInt(document.getElementById("flow-bag-number")?.value || "1", 10);
    const totalBags = parseInt(document.getElementById("flow-total-bags")?.value || "10", 10);
    const samplesPerBagCap = parseInt(document.getElementById("flow-samples-per-bag")?.value || "10", 10);

    this.totalBagsBatchOption = totalBags;
    this.samplesPerBagCapacityOption = samplesPerBagCap;

    const batchName = "Batch " + bagNum + " Samples (Bag " + bagNum + ")";

    let retailerId = null;
    let retailerShopName = village + " Soil Partner";
    if (channel === "Retail Soil Partner" || channel === "All Registered Soil Collection Partners") {
      retailerId = document.getElementById("flow-farmer-retailer")?.value;
      const shp = this.data.shops.find(s => s.id === retailerId);
      if (shp) retailerShopName = shp.shopName;
    }

    // CHECK IF THIS IS AN UPDATE TO AN EXISTING ACTIVE TICKET
    if (this.activeTicket) {
      const t = this.activeTicket;
      t.farmerName = name;
      t.farmerPhone = phone;
      t.village = village;
      t.partnerChannel = channel;
      t.collectionShopId = retailerId;
      t.collectionShopName = retailerShopName;
      t.collectedBy = collectedBy;
      t.bagNumber = bagNum;
      t.batchName = batchName;
      t.totalBagsInCollection = totalBags;
      t.samplesPerBagCapacity = samplesPerBagCap;

      // Also update the farmer record
      const farmer = this.data.farmers.find(f => f.id === t.farmerId);
      if (farmer) {
        farmer.name = name;
        farmer.phone = phone;
        farmer.village = village;
        farmer.type = channel;
        farmer.retailerId = retailerId;
      }

      this.activeStep = 2; // Move smoothly to Bag Pickup
      this.saveData();
      this.render();
      document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // NEW FARMER REGISTRATION: Check if farmer already exists by phone
    let existingFarmer = this.data.farmers.find(f => f.phone === phone);
    let farmerId;
    if (existingFarmer) {
      existingFarmer.name = name; // Update name in case it changed
      existingFarmer.village = village;
      existingFarmer.type = channel;
      existingFarmer.retailerId = retailerId;
      farmerId = existingFarmer.id;
    } else {
      farmerId = "FRM-" + Math.floor(1000 + Math.random() * 9000);
      const newFarmer = {
        id: farmerId,
        name,
        phone,
        type: channel,
        village,
        retailerId,
        registeredAt: new Date().toLocaleString('sv-SE').slice(0, 16)
      };
      this.data.farmers.unshift(newFarmer);
    }

    // Create new Soil Ticket
    const trackingId = this.generateTrackingId();
    const newTicket = {
      trackingId,
      farmerId,
      farmerName: name,
      farmerPhone: phone,
      village,
      partnerChannel: channel,
      collectionShopId: retailerId,
      collectionShopName: retailerShopName,
      collectedBy,
      batchName,
      bagNumber: bagNum,
      totalBagsInCollection: totalBags,
      samplesPerBagCapacity: samplesPerBagCap,
      pickedByRunner: "Chetan Kumar (Runner #04)",
      runnerPhone: "9741001122",
      pickedAt: new Date().toLocaleString('sv-SE').slice(0, 16),
      destinationCentreId: this.data.testingCentres[0]?.id || "TC-CENTRAL",
      destinationCentreName: this.data.testingCentres[0]?.name || "Arkashine Central Lab",
      status: "Pending",
      isTested: false,
      testedAt: null,
      testedBy: "Dr. Vignesh Shastry (Chief Analyst)",
      testerName: "Dr. Vignesh Shastry (Chief Analyst)",
      advisoryNote: "Sample registered. Awaiting pickup and machine test.",
      advisorySent: false,
      advisorySentAt: null,
      advisorySentTo: ""
    };

    this.data.soilSamples.unshift(newTicket);
    this.activeTicket = newTicket;
    this.activeStep = 2; // MOVE SMOOTHLY TO STEP 2 (BAG PICKUP)
    this.saveData();
    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── STEP 2 SUBMIT (Confirm Pickup & Runner Custody Chain) ────────────
  handleStep2Submit() {
    if (!this.activeTicket) return;

    const shopId = document.getElementById("flow-pickup-shop")?.value;
    const runnerName = document.getElementById("flow-pickup-runner")?.value?.trim() || "Chetan Kumar (Runner #04)";
    const runnerPhone = document.getElementById("flow-pickup-runner-phone")?.value?.trim() || "9741001122";
    const tcId = document.getElementById("flow-pickup-tc")?.value;

    const shop = this.data.shops.find(s => s.id === shopId);
    const tc = this.data.testingCentres.find(c => c.id === tcId);

    this.activeTicket.collectionShopId = shopId || null;
    this.activeTicket.collectionShopName = shop ? shop.shopName : (this.activeTicket.village + " Soil Partner");
    this.activeTicket.pickedByRunner = runnerName;
    this.activeTicket.runnerPhone = runnerPhone;
    this.activeTicket.pickedAt = new Date().toLocaleString('sv-SE').slice(0, 16);
    this.activeTicket.destinationCentreId = tc?.id || "TC-CENTRAL";
    this.activeTicket.destinationCentreName = tc ? tc.name : "Arkashine Central Lab";

    this.activeStep = 3; // MOVE SMOOTHLY TO STEP 3 (MACHINE TESTING)
    this.saveData();
    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── STEP 3 SUBMIT (Machine Testing & Chemist) ────────────────────────
  handleStep3Submit() {
    if (!this.activeTicket) return;

    const isTestedChecked = document.getElementById("flow-test-toggle")?.checked;
    const testedBy = document.getElementById("flow-sample-tested-by")?.value?.trim() || "Dr. Vignesh Shastry (Chief Analyst)";
    const tcId = document.getElementById("flow-testing-tc")?.value;
    const tc = this.data.testingCentres.find(c => c.id === tcId);

    this.activeTicket.isTested = isTestedChecked;
    this.activeTicket.status = isTestedChecked ? (this.activeTicket.advisorySent ? "Advisory Sent" : "Tested") : "Pending";
    this.activeTicket.testedBy = testedBy;
    this.activeTicket.testerName = testedBy;

    if (isTestedChecked) {
      this.activeTicket.testedAt = new Date().toLocaleString('sv-SE').slice(0, 16);
      if (tc) tc.totalTestsCount = (tc.totalTestsCount || 0) + 1;
    }

    if (tc) {
      this.activeTicket.destinationCentreId = tc.id;
      this.activeTicket.destinationCentreName = tc.name;
    }

    this.activeStep = 4; // MOVE SMOOTHLY TO STEP 4 (CERTIFICATE)
    this.saveData();
    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── STEP 4 NEXT (Proceed to Step 5: Send Advisory) ───────────────────
  handleStep4Next() {
    if (!this.activeTicket) return;
    this.activeStep = 5; // MOVE SMOOTHLY TO STEP 5 (ADVISORY)
    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── STEP 5 SUBMIT (Send Advisory to Required Source - Final Success) ─
  handleStep5Submit() {
    if (!this.activeTicket) return;

    const advisoryNote = document.getElementById("flow-advisory-note")?.value?.trim() || "Soil certified healthy. Organic compost and split nutrient application recommended.";
    const sentTo = document.getElementById("flow-advisory-sent-to")?.value?.trim() || "Farmer & Village Partner";

    this.activeTicket.advisoryNote = advisoryNote;
    this.activeTicket.advisorySent = true;
    this.activeTicket.advisorySentAt = new Date().toLocaleString('sv-SE').slice(0, 16);
    this.activeTicket.advisorySentTo = sentTo;
    this.activeTicket.status = "Advisory Sent";

    this.saveData();
    this.render();
    document.getElementById("workflow-container")?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── EDIT FARMER IN REGISTERED FARMERS DIRECTORY ──────────────────────
  startEditFarmer(farmerId) {
    this.editingFarmerId = farmerId;
    this.renderFarmersDirectory();
  }

  saveEditFarmer(farmerId) {
    const farmer = this.data.farmers.find(f => f.id === farmerId);
    if (!farmer) return;

    const newName = document.getElementById("edit-farmer-name-" + farmerId)?.value?.trim();
    const newPhone = document.getElementById("edit-farmer-phone-" + farmerId)?.value?.trim();

    if (!newName) {
      alert("Farmer name cannot be empty.");
      return;
    }
    if (!newPhone || newPhone.length !== 10 || isNaN(newPhone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    farmer.name = newName;
    farmer.phone = newPhone;

    // Update all associated soil samples for this farmer
    this.data.soilSamples.forEach(s => {
      if (s.farmerId === farmerId) {
        s.farmerName = newName;
        s.farmerPhone = newPhone;
      }
    });

    if (this.activeTicket && this.activeTicket.farmerId === farmerId) {
      this.activeTicket.farmerName = newName;
      this.activeTicket.farmerPhone = newPhone;
    }

    this.editingFarmerId = null;
    this.saveData();
    this.render();
    alert("✅ Farmer " + newName + " details updated successfully across all records!");
  }

  cancelEditFarmer() {
    this.editingFarmerId = null;
    this.renderFarmersDirectory();
  }

  toggleExpandFarmer(farmerId) {
    this.expandedFarmerId = this.expandedFarmerId === farmerId ? null : farmerId;
    this.renderFarmersDirectory();
  }

  openEditCapacityModal() {
    const bags = prompt("Edit Total Number of Bags in Collection Batch:", this.totalBagsBatchOption);
    if (bags && !isNaN(parseInt(bags, 10))) {
      this.totalBagsBatchOption = parseInt(bags, 10);
    }
    const samples = prompt("Edit How Many Samples per 1 Bag Capacity:", this.samplesPerBagCapacityOption);
    if (samples && !isNaN(parseInt(samples, 10))) {
      this.samplesPerBagCapacityOption = parseInt(samples, 10);
    }
    this.render();
    alert("✅ Updated: " + this.totalBagsBatchOption + " Bags Total | " + this.samplesPerBagCapacityOption + " Samples per Bag!");
  }


  // ─── BATCH & SAMPLE DELETION AND CUSTOMIZATION ───────────────────────
  addNewBatch() {
    this.totalBagsBatchOption = (this.totalBagsBatchOption || 10) + 1;
    this.saveData();
    this.render();
    alert("✅ Batch " + this.totalBagsBatchOption + " (Bag " + this.totalBagsBatchOption + ") added successfully!");
  }

  deleteBatch(bagNumber) {
    const samplesInBag = this.data.soilSamples.filter(s => s.bagNumber === bagNumber);
    if (samplesInBag.length > 0) {
      if (!confirm("Bag " + bagNumber + " currently contains " + samplesInBag.length + " sample(s). Deleting this bag will reassign these samples to Bag 1. Proceed?")) {
        return;
      }
      samplesInBag.forEach(s => {
        s.bagNumber = 1;
        s.batchName = "Batch 1 Samples (Bag 1)";
      });
    }

    if (this.totalBagsBatchOption > 1) {
      this.totalBagsBatchOption--;
    }
    this.saveData();
    this.render();
    alert("✅ Bag " + bagNumber + " removed successfully!");
  }

  editBatchDetails(bagNumber) {
    const currentBatchName = "Batch " + bagNumber + " Samples (Bag " + bagNumber + ")";
    const newName = prompt("Edit Title / Label for Bag " + bagNumber + ":", currentBatchName);
    if (!newName) return;

    const currentCap = this.samplesPerBagCapacityOption || 10;
    const newCap = prompt("Enter Max Sample Capacity for Bag " + bagNumber + ":", currentCap);
    const parsedCap = parseInt(newCap, 10);

    // Update samples that belong to this bag
    this.data.soilSamples.forEach(s => {
      if (s.bagNumber === bagNumber) {
        s.batchName = newName;
        if (!isNaN(parsedCap) && parsedCap > 0) {
          s.samplesPerBagCapacity = parsedCap;
        }
      }
    });

    this.saveData();
    this.render();
    alert("✅ Batch " + bagNumber + " details updated successfully!");
  }

  deleteSampleTicket(trackingId) {
    const sample = this.data.soilSamples.find(s => s.trackingId === trackingId);
    if (!sample) return;

    if (confirm("Are you sure you want to remove sample ticket " + trackingId + " (" + sample.farmerName + ")? This action cannot be undone.")) {
      this.data.soilSamples = this.data.soilSamples.filter(s => s.trackingId !== trackingId);
      if (this.activeTicket && this.activeTicket.trackingId === trackingId) {
        this.activeTicket = null;
        this.activeStep = 1;
      }
      this.saveData();
      this.render();
      alert("✅ Sample ticket " + trackingId + " removed successfully!");
    }
  }

  updateBatchSettingsDirectly() {
    const bagsInput = document.getElementById("direct-total-bags-input");
    const capInput = document.getElementById("direct-bag-capacity-input");
    if (!bagsInput || !capInput) return;

    const newBags = parseInt(bagsInput.value, 10);
    const newCap = parseInt(capInput.value, 10);

    if (isNaN(newBags) || newBags < 1 || newBags > 100) {
      alert("Please enter a valid number of bags (1 to 100).");
      return;
    }
    if (isNaN(newCap) || newCap < 1 || newCap > 100) {
      alert("Please enter a valid capacity per bag (1 to 100).");
      return;
    }

    this.totalBagsBatchOption = newBags;
    this.samplesPerBagCapacityOption = newCap;
    this.saveData();
    this.render();
    alert("✅ Batch & Bag configuration updated successfully: " + newBags + " Bags Total | " + newCap + " Samples/Bag Capacity!");
  }

  // ─── MASTER RENDER ────────────────────────────────────────────────────
  render() {
    this.renderQuickStats();
    this.renderWorkflowBoard();
    this.renderBagsTrackerBox();
    this.renderFarmersDirectory();
    this.renderDirectoryTable();
    this.renderActiveCentresBox();
    this.renderRegionAnalyticsBox();
    this.renderReferenceBoxes();
    this.renderPrintableCard();
  }

  // 1-PAGE SUMMARY STATS STRIP
  renderQuickStats() {
    const statsEl = document.getElementById("quick-stats-strip");
    if (!statsEl) return;

    const totalSamples = this.data.soilSamples.length;
    const testedCount = this.data.soilSamples.filter(s => s.isTested || s.status === "Tested" || s.status === "Advisory Sent").length;
    const pendingCount = totalSamples - testedCount;
    const advisoryCount = this.data.soilSamples.filter(s => s.advisorySent).length;

    statsEl.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">📄 Total Samples</span>
          <div class="text-2xl font-black text-slate-800 mt-0.5">${totalSamples}</div>
          <div class="text-[11px] text-emerald-700 font-semibold mt-0.5">Across All Batches</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">🎒 Bags & Capacity</span>
            <button onclick="app.openEditCapacityModal()" class="text-[10px] font-bold text-blue-700 hover:underline">✏️ Edit</button>
          </div>
          <div class="text-xl font-black text-blue-600 mt-0.5">${this.totalBagsBatchOption} Bags</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${this.samplesPerBagCapacityOption} Samples per Bag</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">✔ Samples Tested</span>
          <div class="text-2xl font-black text-emerald-600 mt-0.5">${testedCount}</div>
          <div class="text-[11px] text-emerald-700 font-semibold mt-0.5">✔ ${testedCount} Done / ${pendingCount} Pending</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">✉️ Final Advisory</span>
          <div class="text-2xl font-black text-purple-600 mt-0.5">${advisoryCount}</div>
          <div class="text-[11px] text-purple-700 font-semibold mt-0.5">✔ Sent to Source</div>
        </div>
      </div>
    `;
  }

  // 1-PAGE 5-STEP SEQUENTIAL WORKFLOW BOARD
  renderWorkflowBoard() {
    const container = document.getElementById("workflow-container");
    if (!container) return;

    const t = this.activeTicket;

    const steps = [
      { num: 1, tag: "1. ORIGIN", sub: "Village Partner", desc: "Collected Sample", color: "emerald" },
      { num: 2, tag: "2. TRANSIT", sub: "Logistics Runner", desc: "Picked & Carried", color: "blue" },
      { num: 3, tag: "3. LABORATORY", sub: "Testing Facility", desc: "Machine Chemist", color: "amber" },
      { num: 4, tag: "4. CERTIFICATION", sub: "Digital Health Card", desc: "Certified Results", color: "purple" },
      { num: 5, tag: "5. ADVISORY", sub: "Farmer & Source", desc: "Final Delivery", color: "teal" }
    ];

    const stepperHTML = steps.map(s => {
      const isActive = this.activeStep === s.num;
      const isPast = this.activeStep > s.num;
      return `
        <div class="p-2.5 rounded-2xl border flex flex-col justify-center ${isActive ? 'bg-'+s.color+'-50 border-'+s.color+'-500 text-'+s.color+'-950 shadow-xs' : isPast ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-50/60 border-slate-200/60 text-slate-400'} transition">
          <div class="flex items-center gap-1.5 text-xs font-black">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isPast ? 'bg-emerald-600 text-white' : isActive ? 'bg-'+s.color+'-600 text-white' : 'bg-slate-200 text-slate-600'}">
              ${isPast ? '✓' : s.num}
            </span>
            <span class="truncate text-[11px] uppercase tracking-wider">${s.tag}</span>
          </div>
          <div class="text-[10px] font-bold mt-1 pl-6 leading-tight ${isActive ? 'text-'+s.color+'-800' : isPast ? 'text-slate-600' : 'text-slate-400'}">
            ${s.sub}
          </div>
          <div class="text-[9px] pl-6 text-slate-400 font-medium">
            ${s.desc}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <!-- Header -->
      <div class="border-b border-slate-100 pb-4 mb-4">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <h2 class="text-base font-black text-slate-800 flex items-center gap-2">
              <span>🧭</span> Chain of Custody: 5-Point Transit Tracking Pipeline
            </h2>
            <p class="text-xs text-slate-500">
              ${t ? ('Working on ticket: <b class="font-mono text-emerald-700">' + t.trackingId + '</b> (' + t.farmerName + ' - ' + (t.batchName || 'Batch 1') + ')') : 'Every soil sample travels through 5 verifiable checkpoints: Origin ➔ Logistics Runner ➔ Laboratory Machine ➔ Digital Certificate ➔ Advisory Delivery'}
            </p>
          </div>

          <div class="flex items-center gap-2">
            ${t ? `
              <button onclick="app.startNewFarmerFlow()" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition">
                ➕ New Sample Registration
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 5-Step Visual Stepper -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
          ${stepperHTML}
        </div>
      </div>

      <!-- Active Step Form Body -->
      <div>
        ${this.renderActiveStepSection()}
      </div>
    `;

    if ((this.activeStep === 2 || this.activeStep === 4) && t) {
      this.renderRealBarcodeAndQR("active-barcode-svg", "active-qrcode", t.trackingId);
    }
  }

  renderActiveStepSection() {
    const t = this.activeTicket;

    // ── STEP 1: REGISTER OR EDIT FARMER ─────────────────────────────────
    if (this.activeStep === 1) {
      const channel = t ? t.partnerChannel : "Village Soil Partner";
      const bagNum = t ? t.bagNumber : 1;

      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-800">
              ${t ? '✏️ Edit Farmer Details & Batch Assignment' : 'Stage 1: Farmer Registration & Consignment Batch Assignment'}
            </h3>
            <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Collection Channels</span>
          </div>

          <!-- Channel Selection -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${channel === 'Village Soil Partner' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'}" id="label-channel-village">
              <input type="radio" name="flow_farmer_channel" value="Village Soil Partner" ${channel === 'Village Soil Partner' ? 'checked' : ''} onchange="app.toggleFlowChannel('Village')" class="text-emerald-600 focus:ring-emerald-500">
              <div>
                <div class="font-bold text-xs text-slate-800">🏡 Village Soil Partner</div>
                <div class="text-[10px] text-slate-500">Village level collection</div>
              </div>
            </label>

            <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${channel === 'Retail Soil Partner' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'}" id="label-channel-retailer">
              <input type="radio" name="flow_farmer_channel" value="Retail Soil Partner" ${channel === 'Retail Soil Partner' ? 'checked' : ''} onchange="app.toggleFlowChannel('Retailer')" class="text-emerald-600 focus:ring-emerald-500">
              <div>
                <div class="font-bold text-xs text-slate-800">🏬 Retail Soil Partner</div>
                <div class="text-[10px] text-slate-500">Retail shop partner</div>
              </div>
            </label>

            <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${channel === 'All Registered Soil Collection Partners' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'}" id="label-channel-all-registered">
              <input type="radio" name="flow_farmer_channel" value="All Registered Soil Collection Partners" ${channel === 'All Registered Soil Collection Partners' ? 'checked' : ''} onchange="app.toggleFlowChannel('Retailer')" class="text-emerald-600 focus:ring-emerald-500">
              <div>
                <div class="font-bold text-xs text-slate-800">🏬 All Registered Partners</div>
                <div class="text-[10px] text-slate-500">Central collection hub</div>
              </div>
            </label>
          </div>

          <!-- Retailer Shop Selection (visible for Retailer or All Registered) -->
          <div id="flow-retailer-row" class="${(channel === 'Retail Soil Partner' || channel === 'All Registered Soil Collection Partners') ? '' : 'hidden'} bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-1">
            <label class="text-xs font-bold text-blue-900 block">Select Collection Partner Shop:</label>
            <select id="flow-farmer-retailer" class="w-full text-xs p-2 rounded-lg border border-blue-300 bg-white font-medium">
              ${this.data.shops.map(s => `
                <option value="${s.id}" ${t && t.collectionShopId === s.id ? 'selected' : ''}>${s.shopName} (${s.category}) - ${s.village} [Prop: ${s.shopkeeper}]</option>
              `).join("")}
            </select>
          </div>

          <!-- Editable Bags & Capacity Options -->
          <div class="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-blue-950 uppercase mb-1">Batch / Bag Selection *</label>
              <select id="flow-bag-number" class="w-full text-xs p-2.5 rounded-xl border border-blue-300 bg-white font-bold text-blue-900">
                ${Array.from({ length: this.totalBagsBatchOption }, (_, i) => i + 1).map(n => `
                  <option value="${n}" ${n === bagNum ? 'selected' : ''}>Batch ${n} Samples (Bag ${n})</option>
                `).join("")}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-blue-950 uppercase mb-1">Total Number of Bags *</label>
              <input 
                type="number" 
                id="flow-total-bags" 
                value="${t ? (t.totalBagsInCollection || this.totalBagsBatchOption) : this.totalBagsBatchOption}" 
                min="1" max="50" 
                onchange="app.totalBagsBatchOption = parseInt(this.value, 10); app.renderWorkflowBoard();"
                class="w-full text-xs p-2.5 rounded-xl border border-blue-300 font-bold text-slate-800"
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-blue-950 uppercase mb-1">Samples per 1 Bag Capacity *</label>
              <input 
                type="number" 
                id="flow-samples-per-bag" 
                value="${t ? (t.samplesPerBagCapacity || this.samplesPerBagCapacityOption) : this.samplesPerBagCapacityOption}" 
                min="1" max="50" 
                onchange="app.samplesPerBagCapacityOption = parseInt(this.value, 10);"
                class="w-full text-xs p-2.5 rounded-xl border border-blue-300 font-bold text-slate-800"
              >
            </div>
          </div>

          <!-- Farmer Details Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Farmer Full Name *</label>
              <input 
                type="text" 
                id="flow-farmer-name" 
                value="${t ? t.farmerName : ''}" 
                placeholder="e.g. Ramesh Gowda" 
                class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number *</label>
              <input 
                type="tel" 
                id="flow-farmer-phone" 
                value="${t ? t.farmerPhone : ''}" 
                placeholder="10-digit number" 
                maxlength="10" 
                class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-600 uppercase">Village (${(this.data.villages || PRESET_VILLAGES).length} Villages) *</label>
                <button type="button" onclick="app.promptAddNewVillage()" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition shadow-2xs">
                  ➕ Add Village
                </button>
              </div>
              <select id="flow-farmer-village" onchange="app.handleVillageSelectChange(this.value)" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium">
                ${(this.data.villages || PRESET_VILLAGES).map(v => `
                  <option value="${v}" ${t && t.village === v ? 'selected' : ''}>${v}</option>
                `).join("")}
                <option value="__ADD_NEW__" class="font-bold text-emerald-700">➕ Add New Village...</option>
              </select>
              <div id="flow-new-village-container" class="hidden mt-2 flex gap-2">
                <input type="text" id="flow-new-village-input" placeholder="Type new village name..." class="flex-1 text-xs p-2 rounded-lg border border-emerald-300 bg-emerald-50/50">
                <button type="button" onclick="app.saveInlineNewVillage()" class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                  Save
                </button>
              </div>
            </div>
          </div>

          <!-- Who Collected / Handed Sample -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Who Collected / Handed Over This Sample? *</label>
            <input 
              type="text" 
              id="flow-sample-collected-by" 
              placeholder="e.g. Manjunath Gowda (Village Partner Owner) / Chetan Kumar (Field Officer)" 
              value="${t ? (t.collectedBy || 'Village Partner Owner') : 'Village Partner Owner'}"
              class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
            >
            <p class="text-[10px] text-slate-400 mt-1">Tracks the origin person who collected/received the sample before pickup</p>
          </div>

          <button 
            onclick="app.handleStep1Submit()"
            class="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <span>${t ? '💾 Update Farmer & Move to Bag Pickup' : '💾 Save Farmer & Move to Bag Pickup'}</span>
            <span>➔</span>
          </button>
        </div>
      `;
    }

    // ── STEP 2: BAG PICKUP & RUNNER LOGISTICS ───────────────────────────
    if (this.activeStep === 2 && t) {
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-800">Stage 2: Consignment Pickup & Chain of Custody (Speed-Post Barcode)</h3>
            <span class="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              👜 ${t.batchName || 'Batch 1 Samples (Bag 1)'}
            </span>
          </div>

          <!-- Postal Barcode & QR Box -->
          <div class="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-[10px] text-emerald-400 font-mono uppercase font-bold">Speed-Post Unique Tracking ID</div>
              <div class="text-2xl font-black mono-font tracking-wider mt-0.5 text-slate-100">${t.trackingId}</div>
              <div class="text-xs text-slate-400 mt-1">
                Farmer: <b class="text-white">${t.farmerName}</b> | Village: <b class="text-emerald-300">${t.village}</b> | Batch: <b class="text-blue-300">${t.batchName || 'Batch 1'}</b>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-white p-2 rounded-xl text-slate-900 shadow">
              <svg id="active-barcode-svg" class="h-10"></svg>
              <div id="active-qrcode" class="p-0.5 bg-white rounded border border-slate-200"></div>
            </div>
          </div>

          <!-- Custody & Transit Tracking Notice -->
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
            <span class="text-base">🚚</span>
            <div>
              <b class="block">Chain of Custody Tracking (Who picked & where it goes):</b>
              <span>Fill in who picked the sample at the village/shop and which diagnostic centre or machine station it is being delivered to.</span>
            </div>
          </div>

          <!-- Pickup Details Form -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Collection Point / Partner Shop</label>
              <select id="flow-pickup-shop" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium">
                <option value="">-- Direct Village Collection (${t.village}) --</option>
                ${this.data.shops.map(s => `
                  <option value="${s.id}" ${s.id === t.collectionShopId ? 'selected' : ''}>
                    ${s.shopName} (${s.category}) - ${s.village}
                  </option>
                `).join("")}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Runner Name (Who Picked Sample) *</label>
              <input type="text" id="flow-pickup-runner" value="${t.pickedByRunner || 'Chetan Kumar (Runner #04)'}" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Runner Phone</label>
              <input type="tel" id="flow-pickup-runner-phone" value="${t.runnerPhone || '9741001122'}" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Send to Testing Facility / Machine Station *</label>
            <select id="flow-pickup-tc" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium">
              ${this.data.testingCentres.map(tc => `
                <option value="${tc.id}" ${tc.id === t.destinationCentreId ? 'selected' : ''}>
                  ${tc.name} [${tc.machineSerial}] — ${tc.location}
                </option>
              `).join("")}
            </select>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button 
              onclick="app.handleStep2Submit()"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>🚚 Confirm Pickup & Proceed to Machine Testing</span>
              <span>➔</span>
            </button>
            <button onclick="app.activeStep = 1; app.render();" class="text-xs text-slate-500 font-semibold hover:underline">
              ↩ Back to Farmer Details
            </button>
          </div>
        </div>
      `;
    }

    // ── STEP 3: MACHINE TESTING STATUS & CHEMIST ────────────────────────
    if (this.activeStep === 3 && t) {
      const isTested = t.isTested || t.status === "Tested" || t.status === "Advisory Sent";
      const batchSamples = this.data.soilSamples.filter(s => s.batchName === t.batchName);
      const batchTestedCount = batchSamples.filter(s => s.isTested || s.status === "Tested" || s.status === "Advisory Sent").length;
      const isBatchCompleted = batchTestedCount === batchSamples.length && batchSamples.length > 0;

      return `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="font-black text-sm text-slate-800 flex items-center gap-2">
                <span>Stage 3: Laboratory Diagnostic Testing & Dual-Personnel Verification</span>
                <span class="text-[10px] font-bold px-2 py-0.5 ${isTested ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} rounded-md">
                  ${isTested ? '✔ Tested' : '❌ Pending'}
                </span>
              </h3>
              <p class="text-xs text-slate-500">Sample Ticket: <b class="font-mono text-emerald-700">${t.trackingId}</b> | Farmer: <b>${t.farmerName}</b> | ${t.batchName || 'Batch 1'}</p>
            </div>
          </div>

          <!-- Sequential Batch Progress Box -->
          <div class="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <div class="font-bold text-blue-950 flex items-center gap-1.5">
                <span>🎒</span> Current Batch: <b>${t.batchName || 'Batch 1 Samples (Bag 1)'}</b>
              </div>
              <div class="text-[11px] text-blue-800">
                Progress: <b>${batchTestedCount} / ${batchSamples.length} Samples Tested</b> inside this Bag
              </div>
            </div>

            <div>
              ${isBatchCompleted ? `
                <span class="px-3 py-1 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-2xs">
                  ✔ Bag Completed! Pick samples from next bag ➔
                </span>
              ` : `
                <span class="px-3 py-1 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-2xs">
                  ⏳ Testing Bag Samples (${batchTestedCount}/${batchSamples.length})
                </span>
              `}
            </div>
          </div>

          <!-- Custody Journey Card -->
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div class="p-2.5 bg-white rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">1. Origin Collection</span>
              <span class="font-bold text-slate-900 block mt-0.5">${t.collectedBy || 'Village Partner'}</span>
              <span class="text-[10px] text-emerald-700">📍 ${t.village}</span>
            </div>
            <div class="p-2.5 bg-white rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">2. Transit Runner</span>
              <span class="font-bold text-blue-900 block mt-0.5">${t.pickedByRunner || '—'}</span>
              <span class="text-[10px] text-slate-500">📞 ${t.runnerPhone || '—'} → ${t.destinationCentreName || 'Lab'}</span>
            </div>
            <div class="p-2.5 bg-white rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">3. Testing Chemist / Analyst</span>
              <input 
                type="text" 
                id="flow-sample-tested-by" 
                value="${t.testedBy || 'Dr. Vignesh Shastry (Chief Analyst)'}" 
                placeholder="Enter chemist/analyst name..."
                class="w-full text-xs p-1 rounded-lg border border-slate-300 font-bold text-slate-800 mt-1"
              >
              <span class="text-[10px] text-purple-700">At ${t.destinationCentreName || 'Lab'}</span>
            </div>
          </div>

          <!-- Simple Testing Control Box -->
          <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Testing Centre / Machine Station *</label>
              <select id="flow-testing-tc" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium">
                ${this.data.testingCentres.map(tc => `
                  <option value="${tc.id}" ${tc.id === t.destinationCentreId ? 'selected' : ''}>
                    ${tc.name} [${tc.machineSerial}]
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- 1-Click Toggle for Tested (✔) vs Pending (❌) -->
            <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div class="font-bold text-xs text-slate-900">Is Sample Testing Completed on Machine?</div>
                <div class="text-[11px] text-slate-500">Toggle to mark correct mark (✔ Done) or cross mark (❌ Pending)</div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-300 shadow-2xs">
                <input type="checkbox" id="flow-test-toggle" ${isTested ? 'checked' : ''} class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500">
                <span class="font-black text-xs ${isTested ? 'text-emerald-700' : 'text-rose-600'}">
                  ${isTested ? '✔ Tested & Completed' : '❌ Pending Test'}
                </span>
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button 
              onclick="app.handleStep3Submit()"
              class="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>🔬 Complete Testing & View Certificate</span>
              <span>➔</span>
            </button>
            <button onclick="app.activeStep = 2; app.render();" class="text-xs text-slate-500 font-semibold hover:underline">
              ↩ Back to Pickup Details
            </button>
          </div>
        </div>
      `;
    }

    // ── STEP 4: CERTIFICATE HANDOVER & PREVIEW ──────────────────────────
    if (this.activeStep === 4 && t) {
      const isTested = t.isTested || t.status === "Tested" || t.status === "Advisory Sent";

      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">✓</span>
              <div>
                <h3 class="font-black text-base text-slate-900">Stage 4: Official Soil Diagnostic Certificate & Handover</h3>
                <p class="text-xs text-slate-500">Tracking ID: <b class="font-mono text-emerald-700">${t.trackingId}</b> | Farmer: <b>${t.farmerName}</b></p>
              </div>
            </div>
            <span class="text-xs ${isTested ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              ${isTested ? '✔ Tested' : '❌ Pending'}
            </span>
          </div>

          <!-- Custody Summary Banner -->
          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div class="flex items-center justify-between">
              <div class="font-black text-emerald-950 text-sm">🌾 Official Soil Certificate for ${t.farmerName}</div>
              <span class="text-[11px] font-bold text-emerald-800">Bag: ${t.batchName || 'Batch 1'}</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-emerald-200/60">
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">1. Origin Collected By</span><b>${t.collectedBy || '—'}</b></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">2. Runner (Picked)</span><b>${t.pickedByRunner || '—'}</b></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">3. Destination Lab</span><b>${t.destinationCentreName || '—'}</b></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold">4. Tested By</span><b>${t.testedBy || '—'}</b></div>
            </div>
          </div>

          <!-- Barcode & QR Code Preview -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div class="text-xs font-bold text-slate-700">Official Postal Barcode & QR Code:</div>
              <p class="text-[11px] text-slate-400">Scannable by postal runner or diagnostic operator</p>
            </div>
            <div class="flex items-center gap-3">
              <svg id="active-barcode-svg" class="h-10"></svg>
              <div id="active-qrcode" class="p-1 border border-slate-200 rounded bg-white"></div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button 
              onclick="app.shareOnWhatsApp('${t.trackingId}')"
              class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>📲</span> Share on WhatsApp
            </button>

            <button 
              onclick="window.print()"
              class="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>🖨️</span> Print Certificate
            </button>

            <button 
              onclick="app.handleStep4Next()"
              class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>✉️</span> Proceed to Step 5: Send Advisory ➔
            </button>
          </div>

          <div class="pt-1">
            <button onclick="app.activeStep = 3; app.render();" class="text-xs text-slate-500 font-semibold hover:underline">
              ↩ Back to Testing Status
            </button>
          </div>
        </div>
      `;
    }

    // ── STEP 5: FINAL ADVISORY SENT TO REQUIRED SOURCE ───────────────────
    if (this.activeStep === 5 && t) {
      const isSent = t.advisorySent;

      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">✉️</span>
              <div>
                <h3 class="font-black text-base text-slate-900">Stage 5: Final Advisory Delivery to Destination Source</h3>
                <p class="text-xs text-slate-500">Final workflow step — advisory delivered where all testing is completed</p>
              </div>
            </div>
            <span class="text-xs ${isSent ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'} font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              ${isSent ? '✔ Advisory Delivered' : '⏳ Awaiting Handover'}
            </span>
          </div>

          ${isSent ? `
            <!-- SUCCESS BANNER -->
            <div class="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🎉</span>
                <div>
                  <div class="font-black text-teal-950 text-sm">Workflow Completed Successfully!</div>
                  <div class="text-xs text-teal-800">
                    Advisory for <b>${t.farmerName}</b> (${t.trackingId}) was sent to: <b>${t.advisorySentTo}</b> on <b>${t.advisorySentAt}</b>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-white rounded-xl border border-teal-200 text-xs text-slate-800 space-y-1">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Advisory & Recommendation Message:</span>
                <p class="font-medium">${t.advisoryNote}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2">
              <button 
                onclick="app.shareOnWhatsApp('${t.trackingId}')"
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <span>📲</span> Re-send WhatsApp
              </button>

              <button 
                onclick="app.startNewFarmerFlow()"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <span>➕</span> Register Next Farmer
              </button>
            </div>
          ` : `
            <!-- FORM TO SEND ADVISORY -->
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Farmer & Contact</span>
                  <span class="font-bold text-slate-900">${t.farmerName} (📞 ${t.farmerPhone})</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Village & Collection Partner</span>
                  <span class="font-bold text-emerald-700">${t.village} — ${t.collectionShopName || 'Direct'}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Runner (Picked By)</span>
                  <span class="font-bold text-blue-900">${t.pickedByRunner || '—'} → ${t.destinationCentreName || 'Lab'}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Tested By (Chemist)</span>
                  <span class="font-bold text-purple-900">${t.testedBy || '—'} (✔ Tested)</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Advisory & Recommendation Message *</label>
                <textarea 
                  id="flow-advisory-note" 
                  rows="3" 
                  placeholder="e.g. Soil certified healthy. pH is 6.8 (neutral). Recommend adding organic compost and split application of nitrogen." 
                  class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium resize-none focus:ring-2 focus:ring-teal-500"
                >${t.advisoryNote && t.advisoryNote !== 'Sample registered. Awaiting pickup and machine test.' ? t.advisoryNote : 'Soil certified healthy. pH is 6.8 (neutral). Recommend adding organic compost and split application of nitrogen.'}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Where is the advisory being sent to? (Required Source) *</label>
                <input 
                  type="text" 
                  id="flow-advisory-sent-to" 
                  value="Farmer directly via WhatsApp & ${t.village} Soil Partner" 
                  placeholder="e.g. Farmer directly / Village Soil Partner / Retail Shop"
                  class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-500"
                >
                <p class="text-[10px] text-slate-400 mt-1">Specify destination source: farmer directly, retail shop, village soil partner centre, etc.</p>
              </div>

              <div class="flex items-center gap-2 pt-2 flex-wrap">
                <button 
                  onclick="app.shareOnWhatsApp('${t.trackingId}')"
                  class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>📲</span> Send to Farmer WhatsApp First
                </button>

                <button 
                  onclick="app.handleStep5Submit()"
                  class="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>✔ Confirm Advisory Sent — Complete!</span>
                  <span>🎉</span>
                </button>
              </div>
            </div>

            <div class="pt-1">
              <button onclick="app.activeStep = 4; app.render();" class="text-xs text-slate-500 font-semibold hover:underline">
                ↩ Back to Certificate
              </button>
            </div>
          `}
        </div>
      `;
    }

    return '';
  }

  // ─── SECTION 3: BATCH & BAG TRACKER ───────────────────────────────────
  renderBagsTrackerBox() {
    const box = document.getElementById("bags-tracker-container");
    if (!box) return;

    const batchMap = {};
    for (let i = 1; i <= (this.totalBagsBatchOption || 10); i++) {
      const bKey = "Batch " + i + " Samples (Bag " + i + ")";
      batchMap[bKey] = {
        name: bKey,
        bagNumber: i,
        samples: [],
        testedCount: 0,
        pendingCount: 0
      };
    }

    this.data.soilSamples.forEach(s => {
      const bKey = s.batchName || ("Batch " + (s.bagNumber || 1) + " Samples (Bag " + (s.bagNumber || 1) + ")");
      if (!batchMap[bKey]) {
        batchMap[bKey] = {
          name: bKey,
          bagNumber: s.bagNumber || 1,
          samples: [],
          testedCount: 0,
          pendingCount: 0
        };
      }
      batchMap[bKey].samples.push(s);
      if (s.isTested || s.status === "Tested" || s.status === "Advisory Sent") {
        batchMap[bKey].testedCount++;
      } else {
        batchMap[bKey].pendingCount++;
      }
    });

    const batchList = Object.values(batchMap);

    box.innerHTML = `
      <!-- Professional Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
        <div>
          <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>🎒</span> Soil Consignment & Batch Monitoring (${this.totalBagsBatchOption} Bags Configured)
          </h3>
          <p class="text-[11px] text-slate-500">
            Real-time consignment capacity, runner logistics custody, and laboratory diagnostic completion per bag.
          </p>
        </div>

        <!-- Direct Inline Controls to Edit Number of Bags and Capacity -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <span class="text-[10px] font-bold text-slate-500 pl-1 uppercase">Bags:</span>
            <input 
              type="number" 
              id="direct-total-bags-input" 
              value="${this.totalBagsBatchOption}" 
              min="1" max="100" 
              class="w-14 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 text-xs"
            />
            <span class="text-[10px] font-bold text-slate-500 uppercase">Cap/Bag:</span>
            <input 
              type="number" 
              id="direct-bag-capacity-input" 
              value="${this.samplesPerBagCapacityOption}" 
              min="1" max="100" 
              class="w-14 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 text-xs"
            />
            <button 
              onclick="app.updateBatchSettingsDirectly()"
              class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-2xs"
              title="Apply new bag count and capacity"
            >
              💾 Apply
            </button>
          </div>

          <button 
            onclick="app.addNewBatch()"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-2xs flex items-center gap-1"
          >
            <span>➕</span> Add Bag
          </button>
        </div>
      </div>

      <!-- Batch Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
        ${batchList.map(b => {
          const isCompleted = b.samples.length > 0 && b.testedCount === b.samples.length;
          const hasSamples = b.samples.length > 0;

          return `
            <div 
              class="p-3.5 rounded-2xl border ${isCompleted ? 'border-emerald-300 bg-emerald-50/40' : hasSamples ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'} hover:shadow-md transition space-y-2.5 relative group"
            >
              <!-- Card Header with Bag Name & Edit Options -->
              <div class="flex items-center justify-between">
                <div class="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <span>👜</span>
                  <span class="truncate max-w-[150px]">${b.name}</span>
                </div>

                <div class="flex items-center gap-1">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">
                    ${b.samples.length} / ${this.samplesPerBagCapacityOption} Cap
                  </span>
                  <button 
                    onclick="event.stopPropagation(); app.editBatchDetails(${b.bagNumber})"
                    class="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition text-[11px]"
                    title="Edit bag name / capacity"
                  >
                    ✏️
                  </button>
                  <button 
                    onclick="event.stopPropagation(); app.deleteBatch(${b.bagNumber})"
                    class="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition text-[11px]"
                    title="Remove this bag"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Diagnostic Progress Counter -->
              <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span class="font-bold text-emerald-700 flex items-center gap-1">
                  <span>✔</span> ${b.testedCount} Tested
                </span>
                <span class="font-bold text-rose-600 flex items-center gap-1">
                  <span>❌</span> ${b.pendingCount} Pending
                </span>
              </div>

              <!-- Samples in this Bag preview -->
              <div class="space-y-1.5 pt-1 text-[11px]">
                ${b.samples.length === 0 ? `
                  <div class="text-slate-400 italic text-xs py-1">No samples assigned to this bag yet.</div>
                ` : b.samples.slice(0, 3).map(s => `
                  <div class="p-1.5 bg-white rounded-xl border border-slate-100 space-y-0.5 shadow-2xs">
                    <div class="flex items-center justify-between font-semibold text-slate-800">
                      <span>${s.farmerName} (${s.village})</span>
                      <span class="font-black font-mono ${(s.isTested || s.status === 'Tested' || s.status === 'Advisory Sent') ? 'text-emerald-600' : 'text-rose-600'}">
                        ${(s.isTested || s.status === 'Tested' || s.status === 'Advisory Sent') ? '✔' : '❌'}
                      </span>
                    </div>
                    <div class="text-[9px] text-slate-400 flex items-center justify-between">
                      <span>Origin: ${s.collectedBy || 'Partner'}</span>
                      <span>Analyst: ${s.testedBy || 'Analyst'}</span>
                    </div>
                  </div>
                `).join("")}
                ${b.samples.length > 3 ? `<div class="text-[10px] text-slate-400 text-right font-medium">+${b.samples.length - 3} more samples...</div>` : ''}
              </div>

              <!-- Card Footer with Filter Button & Status -->
              <div class="pt-2 text-[10px] font-bold flex items-center justify-between border-t border-slate-100">
                <button 
                  onclick="app.searchQuery = 'Batch ${b.bagNumber}'; app.renderDirectoryTable();"
                  class="text-blue-700 hover:underline flex items-center gap-0.5"
                >
                  <span>🔍 View All (${b.samples.length})</span>
                </button>
                <div class="${isCompleted ? 'text-emerald-700' : hasSamples ? 'text-blue-700' : 'text-slate-400'}">
                  ${isCompleted ? '✔ Bag Complete' : hasSamples ? '🚚 Active Custody' : '⏳ Ready for Intake'}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // ─── SECTION 3B: REGISTERED FARMERS DIRECTORY (UNIQUE PER FARMER) ─────
  renderFarmersDirectory() {
    const box = document.getElementById("farmers-directory-container");
    if (!box) return;

    box.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div>
          <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>👤</span> Registered Farmers List (${this.data.farmers.length})
          </h3>
          <p class="text-[11px] text-slate-500">
            Each farmer registered at Village or Retail level appears once. Click to expand full information & edit.
          </p>
        </div>

        <button 
          onclick="app.startNewFarmerFlow()"
          class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
        >
          <span>➕</span> Register Farmer
        </button>
      </div>

      <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        ${this.data.farmers.length === 0 ? `
        <div class="p-6 text-center text-slate-400 italic text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No farmers registered yet. Click "➕ Register Farmer" above to intake your first farmer sample.
        </div>
      ` : this.data.farmers.map(f => {
          const farmerSamples = this.data.soilSamples.filter(s => s.farmerId === f.id || s.farmerPhone === f.phone);
          const testedCount = farmerSamples.filter(s => s.isTested || s.status === "Tested" || s.status === "Advisory Sent").length;
          const isExpanded = this.expandedFarmerId === f.id;
          const isEditing = this.editingFarmerId === f.id;

          if (isEditing) {
            return `
              <div class="p-3.5 rounded-2xl border border-blue-300 bg-blue-50/60 space-y-3 text-xs">
                <div class="font-bold text-blue-950 flex items-center justify-between">
                  <span>✏️ Edit Farmer Name & Phone</span>
                  <span class="text-[10px] text-blue-700">ID: ${f.id}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 uppercase mb-1">Farmer Full Name</label>
                    <input type="text" id="edit-farmer-name-${f.id}" value="${f.name}" class="w-full p-2 text-xs rounded-xl border border-blue-300 bg-white font-semibold">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 uppercase mb-1">Mobile Number (10 digits)</label>
                    <input type="tel" id="edit-farmer-phone-${f.id}" value="${f.phone}" maxlength="10" class="w-full p-2 text-xs rounded-xl border border-blue-300 bg-white font-semibold">
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="app.saveEditFarmer('${f.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs">
                    ✔ Save Changes
                  </button>
                  <button onclick="app.cancelEditFarmer()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs">
                    ✕ Cancel
                  </button>
                </div>
              </div>
            `;
          }

          return `
            <div class="rounded-2xl border ${isExpanded ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 bg-white'} transition hover:border-slate-300">
              <div 
                class="p-3 flex items-center justify-between cursor-pointer"
                onclick="app.toggleExpandFarmer('${f.id}')"
              >
                <div class="flex items-center gap-3 text-xs">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                    ${f.name ? f.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>${f.name}</span>
                      <span class="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        📍 ${f.village}
                      </span>
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">
                      📞 ${f.phone} | Channel: <b>${f.type}</b> | ${farmerSamples.length} Sample${farmerSamples.length === 1 ? '' : 's'} (${testedCount} Tested)
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    onclick="event.stopPropagation(); app.startEditFarmer('${f.id}')"
                    class="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-lg text-[10px] font-bold transition"
                  >
                    ✏️ Edit Name
                  </button>
                  <span class="text-slate-400 text-xs font-bold">
                    ${isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              ${isExpanded ? `
                <!-- EXPANDED FULL INFORMATION CARD -->
                <div class="border-t border-slate-100 p-3.5 space-y-3 bg-white/70 text-xs rounded-b-2xl">
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div class="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-slate-400 block text-[9px] uppercase font-bold">Registration ID</span>
                      <span class="font-mono font-bold text-slate-800">${f.id}</span>
                    </div>
                    <div class="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-slate-400 block text-[9px] uppercase font-bold">Onboarding Channel</span>
                      <span class="font-bold text-emerald-800">${f.type}</span>
                    </div>
                    <div class="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-slate-400 block text-[9px] uppercase font-bold">Registered At</span>
                      <span class="font-semibold text-slate-700">${f.registeredAt || '—'}</span>
                    </div>
                    <div class="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-slate-400 block text-[9px] uppercase font-bold">Test Status</span>
                      <span class="font-bold ${testedCount === farmerSamples.length && farmerSamples.length > 0 ? 'text-emerald-700' : 'text-amber-700'}">
                        ${testedCount} ✔ / ${farmerSamples.length - testedCount} ❌
                      </span>
                    </div>
                  </div>

                  <!-- Farmer's Soil Sample Consignments -->
                  <div>
                    <div class="font-bold text-slate-800 text-xs mb-1.5 flex items-center justify-between">
                      <span>Soil Samples & Journey Custody for ${f.name}:</span>
                      <span class="text-[10px] text-slate-400">${farmerSamples.length} total</span>
                    </div>

                    ${farmerSamples.length === 0 ? `
                      <div class="text-slate-400 italic text-xs p-2">No soil samples registered for this farmer yet.</div>
                    ` : `
                      <div class="space-y-1.5">
                        ${farmerSamples.map(s => {
                          const isDone = s.isTested || s.status === "Tested" || s.status === "Advisory Sent";
                          return `
                            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                              <div class="flex items-center justify-between">
                                <span class="font-mono font-bold text-slate-900">${s.trackingId}</span>
                                <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                  ${isDone ? '✔ Tested' : '❌ Pending'}
                                </span>
                              </div>
                              <div class="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[10px] text-slate-600">
                                <div>👜 <b>${s.batchName || 'Bag 1'}</b></div>
                                <div>👤 Given: <b>${s.collectedBy || '—'}</b></div>
                                <div>🚚 Picked by: <b>${s.pickedByRunner || '—'}</b></div>
                                <div>🏢 Destination: <b>${s.destinationCentreName || 'Lab'}</b></div>
                                <div>🔬 Tested by: <b>${s.testedBy || '—'}</b></div>
                                <div>✉️ Advisory: <b>${s.advisorySent ? ('Sent to ' + s.advisorySentTo) : 'Pending'}</b></div>
                              </div>
                              <div class="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                                <button onclick="app.loadExistingTicket('${s.trackingId}', 1)" class="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                                  ✏️ Edit Ticket in Step 1
                                </button>
                                <button onclick="app.loadExistingTicket('${s.trackingId}', 4)" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                                  🖨️ View Certificate
                                </button>
                                <button onclick="app.shareOnWhatsApp('${s.trackingId}')" class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                                  📲 WhatsApp
                                </button>
                              </div>
                            </div>
                          `;
                        }).join("")}
                      </div>
                    `}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // ─── SECTION 4: DIRECTORY TABLE (ALL SOIL SAMPLE TICKETS) ─────────────
  renderDirectoryTable() {
    const container = document.getElementById("directory-container");
    if (!container) return;

    const activeStatus = this.statusFilter || "All";
    let list = this.data.soilSamples;

    if (activeStatus !== "All") {
      if (activeStatus === "Tested") {
        list = list.filter(s => s.isTested || s.status === "Tested" || s.status === "Advisory Sent");
      } else if (activeStatus === "Pending") {
        list = list.filter(s => !s.isTested && s.status !== "Tested" && s.status !== "Advisory Sent");
      }
    }

    if (this.searchQuery.trim() !== "") {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.trackingId.toLowerCase().includes(q) || 
        s.farmerName.toLowerCase().includes(q) ||
        s.farmerPhone.includes(q) ||
        s.village.toLowerCase().includes(q) ||
        (s.batchName && s.batchName.toLowerCase().includes(q)) ||
        (s.collectedBy && s.collectedBy.toLowerCase().includes(q)) ||
        (s.pickedByRunner && s.pickedByRunner.toLowerCase().includes(q)) ||
        (s.destinationCentreName && s.destinationCentreName.toLowerCase().includes(q)) ||
        (s.testedBy && s.testedBy.toLowerCase().includes(q))
      );
    }

    const testedCount = this.data.soilSamples.filter(s => s.isTested || s.status === "Tested" || s.status === "Advisory Sent").length;
    const pendingCount = this.data.soilSamples.length - testedCount;

    container.innerHTML = `
      <div class="p-5 border-b border-slate-100 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
              <span>🌾</span> Central Soil Consignment Ledger (${list.length})
            </h3>
            <p class="text-xs text-slate-500">Consolidated sample ledger with verified transit custody, diagnostic results, and advisory logs</p>
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search farmer, runner, chemist, village..." 
              value="${this.searchQuery}"
              oninput="app.searchQuery = this.value; app.renderDirectoryTable();"
              class="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 font-medium shadow-2xs"
            />
            ${this.searchQuery ? `
              <button onclick="app.searchQuery = ''; app.renderDirectoryTable();" class="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-1">✕</button>
            ` : ''}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
          <button 
            onclick="app.statusFilter = 'All'; app.renderDirectoryTable();" 
            class="px-3 py-1 rounded-lg font-bold transition ${activeStatus === 'All' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
          >
            All Tickets (${this.data.soilSamples.length})
          </button>
          <button 
            onclick="app.statusFilter = 'Tested'; app.renderDirectoryTable();" 
            class="px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${activeStatus === 'Tested' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}"
          >
            <span>✔</span> Tested (${testedCount})
          </button>
          <button 
            onclick="app.statusFilter = 'Pending'; app.renderDirectoryTable();" 
            class="px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${activeStatus === 'Pending' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}"
          >
            <span>❌</span> Pending (${pendingCount})
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-3 px-4">Tracking ID</th>
              <th class="py-3 px-4">Farmer Details</th>
              <th class="py-3 px-4">Origin (Collected By)</th>
              <th class="py-3 px-4">🚚 Picked By (Runner) → Where He Went</th>
              <th class="py-3 px-4">Batch & Bag</th>
              <th class="py-3 px-4 text-center">Status & Chemist</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${list.length === 0 ? `
              <tr><td colspan="7" class="py-8 text-center text-slate-400">No soil sample tickets found.</td></tr>
            ` : list.map(s => {
              const isTested = s.isTested || s.status === "Tested" || s.status === "Advisory Sent";
              return `
                <tr class="hover:bg-slate-50 transition ${this.activeTicket?.trackingId === s.trackingId ? 'bg-emerald-50/50' : ''}">
                  <td class="py-3 px-4 font-mono font-bold text-slate-800">${s.trackingId}</td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${s.farmerName}</div>
                    <div class="text-[10px] text-slate-500">📞 ${s.farmerPhone}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-[10px] text-emerald-700 font-bold">📍 ${s.village}</div>
                    <div class="text-[11px] font-semibold text-slate-800">👤 ${s.collectedBy || 'Village Partner'}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-blue-900 flex items-center gap-1">
                      <span>🚚</span> ${s.pickedByRunner || 'Not picked yet'}
                    </div>
                    ${s.runnerPhone ? `<div class="text-[10px] text-slate-400">📞 ${s.runnerPhone}</div>` : ''}
                    ${s.destinationCentreName ? `<div class="text-[10px] text-slate-600">→ <b>${s.destinationCentreName}</b></div>` : ''}
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-blue-900">${s.batchName || 'Batch 1 Samples (Bag 1)'}</div>
                    <div class="text-[10px] text-slate-400">Bag ${s.bagNumber || 1} of ${this.totalBagsBatchOption}</div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    ${isTested ? `
                      <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✔ Tested
                      </span>
                      <div class="text-[10px] text-slate-500 font-semibold mt-0.5">By: ${s.testedBy || 'Analyst'}</div>
                    ` : `
                      <span class="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        ❌ Pending
                      </span>
                      <div class="text-[10px] text-slate-400 mt-0.5">Awaiting Chemist</div>
                    `}
                    ${s.advisorySent ? `
                      <div class="text-[9px] text-teal-700 font-bold mt-0.5">✉️ Advisory Sent</div>
                    ` : ''}
                  </td>
                  <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button 
                      onclick="app.toggleSampleTestStatus('${s.trackingId}')" 
                      class="px-2.5 py-1 ${isTested ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'} rounded font-bold text-[11px] transition shadow-xs"
                      title="Toggle test status"
                    >
                      ${isTested ? '❌ Mark Pending' : '✔ Mark Tested'}
                    </button>
                    <button 
                      onclick="app.loadExistingTicket('${s.trackingId}')" 
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition shadow-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onclick="app.previewCardForSample('${s.trackingId}')" 
                      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                    >
                      🖨️
                    </button>
                    <button 
                      onclick="app.shareOnWhatsApp('${s.trackingId}')" 
                      class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition"
                      title="Share certificate on WhatsApp"
                    >
                      📲
                    </button>
                    <button 
                      onclick="app.deleteSampleTicket('${s.trackingId}')" 
                      class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold text-[11px] border border-rose-200 transition"
                      title="Delete / Remove this sample ticket"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ─── SECTION 5: TESTING CENTRES BREAKDOWN ─────────────────────────────
  renderActiveCentresBox() {
    const box = document.getElementById("active-centres-box");
    if (!box) return;

    const grandTotalDone = this.data.testingCentres.reduce((acc, c) => acc + (c.totalTestsCount || 0), 0);

    box.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 class="font-black text-slate-800 text-sm flex items-center gap-1.5">
            <span>🧪</span> Testing Centres Breakdown (${this.data.testingCentres.length})
          </h4>
          <p class="text-[11px] text-slate-500">In which testing centre how many done summary</p>
        </div>
        <button onclick="app.openRegisterCentreModal()" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition shadow-2xs">
          ➕ Register Centre
        </button>
      </div>

      <!-- Prominent Summary Banner -->
      <div class="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between mb-3">
        <div>
          <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Tests Completed Across Centres</div>
          <div class="text-xl font-black font-mono text-emerald-300">✔ ${grandTotalDone} Samples Tested</div>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-slate-300">${this.data.testingCentres.length} Active Stations</span>
        </div>
      </div>

      <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
        ${this.data.testingCentres.map(tc => `
          <div class="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="font-extrabold text-slate-900 flex items-center gap-1.5">
                  ${tc.name}
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-bold">${tc.machineSerial}</span>
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  👤 Operator: <b>${tc.operatorName}</b> (📞 ${tc.operatorPhone}) | 📍 ${tc.location}
                </div>
              </div>

              <div class="text-right shrink-0 space-y-1">
                <div class="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span class="font-black text-emerald-700 text-base block">✔ ${tc.totalTestsCount}</span>
                  <span class="text-[8px] block text-emerald-800 uppercase font-bold">Samples Done</span>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ─── SECTION 6: REGION-WISE BREAKDOWN ─────────────────────────────────
  renderRegionAnalyticsBox() {
    const box = document.getElementById("region-analytics-box");
    if (!box) return;

    const regionMap = {};
    this.data.soilSamples.forEach(s => {
      if (!regionMap[s.village]) regionMap[s.village] = { total: 0, tested: 0 };
      regionMap[s.village].total++;
      if (s.isTested || s.status === "Tested" || s.status === "Advisory Sent") {
        regionMap[s.village].tested++;
      }
    });

    const regions = Object.entries(regionMap).sort((a, b) => b[1].total - a[1].total);

    box.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <span>📊</span> Region-Wise Breakdown
          </h4>
          <p class="text-[11px] text-slate-500">Distribution of samples by village</p>
        </div>
      </div>
      <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-2 max-h-64 overflow-y-auto">
        ${regions.length === 0 ? `
          <div class="text-slate-400 italic">No samples registered yet.</div>
        ` : regions.map(([village, counts]) => `
          <div class="flex justify-between items-center font-bold text-slate-700 p-1.5 bg-white rounded-lg border border-slate-100">
            <span>📍 ${village}</span>
            <div class="flex items-center gap-2">
              <span class="text-emerald-700 font-mono">✔ ${counts.tested} Tested</span>
              <span class="text-slate-300">|</span>
              <span class="text-slate-500 font-mono">${counts.total} Total</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ─── SECTION 7: COLLECTION PARTNERS DIRECTORY ─────────────────────────
  renderReferenceBoxes() {
    const pBox = document.getElementById("partners-reference-box");
    if (pBox) {
      pBox.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span>🏬</span> Collection Partners Directory (${this.data.shops.length})
            </h4>
            <p class="text-[11px] text-slate-500">Village Soil Partner, Retail Soil Partner, All Registered Soil Collection Partners</p>
          </div>
          <button onclick="app.openRegisterPartnerModal()" class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition shadow-2xs">
            + Add Partner
          </button>
        </div>

        <div class="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
          ${this.data.shops.map(s => `
            <div class="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-800">${s.shopName}</div>
                <div class="text-[10px] text-slate-500">👤 ${s.shopkeeper} (📞 ${s.phone}) | 📍 ${s.village}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${s.category}</span>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  // ─── SECTION 8: PRINTABLE SOIL HEALTH CERTIFICATE ─────────────────────
  renderPrintableCard() {
    const container = document.getElementById("printable-card-container");
    if (!container) return;

    const sample = this.activeTicket || (this.data.soilSamples && this.data.soilSamples.length > 0 ? this.data.soilSamples[0] : null);
    if (!sample) { container.innerHTML = ""; return; }

    const isTested = sample.isTested || sample.status === "Tested" || sample.status === "Advisory Sent";

    container.innerHTML = `
      <div id="soil-health-card-print" class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 no-print mt-6">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="font-black text-lg text-slate-900">Arkashine Soil Collection Centre Test Certificate</h3>
            <p class="text-xs text-slate-500">Tracking ID: ${sample.trackingId} | ${sample.batchName || 'Batch 1'}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black ${isTested ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${isTested ? '✔ TESTED & CERTIFIED' : '❌ PENDING TEST'}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
            <span class="font-bold text-slate-900">${sample.farmerName}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Village</span>
            <span class="font-bold text-emerald-700">${sample.village}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Collected / Given By</span>
            <span class="font-bold text-slate-800 truncate block">${sample.collectedBy || 'Village Partner Owner'}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Tested By (Chemist)</span>
            <span class="font-bold text-blue-900 truncate block">${sample.testedBy || 'Chief Analyst'}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Picked By (Runner)</span>
            <span class="font-bold text-slate-800 truncate block">${sample.pickedByRunner || 'Runner'}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Destination Facility</span>
            <span class="font-bold text-purple-900 truncate block">${sample.destinationCentreName || 'Lab'}</span>
          </div>
          ${sample.advisorySent ? `
            <div class="col-span-2">
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Advisory Delivered To</span>
              <span class="font-bold text-teal-700">${sample.advisorySentTo}</span>
            </div>
          ` : ''}
        </div>

        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium">
          ${sample.advisoryNote || 'Soil is certified healthy. Recommend organic compost and standard split nutrient application.'}
        </div>
      </div>
    `;
  }

  renderRealBarcodeAndQR(barcodeId, qrId, text) {
    setTimeout(() => {
      try {
        if (window.JsBarcode && document.getElementById(barcodeId)) {
          JsBarcode("#" + barcodeId, text, {
            format: "CODE128",
            width: 1.5,
            height: 38,
            displayValue: true,
            fontSize: 10
          });
        }
      } catch (e) {}

      try {
        const qrEl = document.getElementById(qrId);
        if (qrEl && window.QRCode) {
          qrEl.innerHTML = "";
          new QRCode(qrEl, {
            text: text,
            width: 50,
            height: 50
          });
        }
      } catch (e) {}
    }, 80);
  }

  toggleFlowChannel(type) {
    const rRow = document.getElementById("flow-retailer-row");
    if (type === "Retailer" || type === "Retail Soil Partner" || type === "All Registered Soil Collection Partners") {
      rRow?.classList.remove("hidden");
    } else {
      rRow?.classList.add("hidden");
    }
  }

  handleVillageSelectChange(val) {
    const container = document.getElementById("flow-new-village-container");
    if (val === "__ADD_NEW__") container?.classList.remove("hidden");
    else container?.classList.add("hidden");
  }

  saveInlineNewVillage() {
    const val = document.getElementById("flow-new-village-input")?.value?.trim();
    if (val) {
      if (!this.data.villages.includes(val)) this.data.villages.push(val);
      this.saveData();
      this.render();
      alert("✅ Village " + val + " added!");
    }
  }

  promptAddNewVillage() {
    const val = prompt("Enter new village name:");
    if (val && val.trim()) {
      const clean = val.trim();
      if (!this.data.villages.includes(clean)) this.data.villages.push(clean);
      this.saveData();
      this.render();
      alert("✅ Village " + clean + " added!");
    }
  }

  openRegisterPartnerModal() {
    const name = prompt("Enter Collection Partner Shop Name:");
    if (!name) return;
    const keeper = prompt("Enter Shopkeeper / Partner Name:");
    const phone = prompt("Enter Contact Phone Number:");
    const village = prompt("Enter Village:");

    this.data.shops.push({
      id: "SHP-" + Math.floor(100 + Math.random() * 900),
      shopName: name,
      shopkeeper: keeper || "Partner Owner",
      phone: phone || "9845000000",
      category: "Village Soil Partner",
      village: village || "Harohalli",
      address: "Main Road, " + (village || 'Harohalli'),
      samplesCollected: 0
    });

    this.saveData();
    this.render();
    alert("✅ Partner " + name + " registered successfully!");
  }

  openRegisterCentreModal() {
    const name = prompt("Enter Testing Centre / Machine Name:");
    if (!name) return;
    const serial = prompt("Enter Machine Serial Number:") || ("ARK-PORT-SCANNER-M" + Math.floor(10 + Math.random() * 89));
    const operator = prompt("Enter Operator / Chemist Name:") || "Testing Executive";

    this.data.testingCentres.push({
      id: "TC-MACH-" + Math.floor(100 + Math.random() * 900),
      name,
      type: "Deployed Machine",
      machineSerial: serial,
      operatorName: operator,
      operatorPhone: "9880000000",
      location: "Karnataka Region",
      dateDeployed: new Date().toISOString().slice(0, 10),
      status: "Active",
      totalTestsCount: 0
    });

    this.saveData();
    this.render();
    alert("✅ Testing station " + name + " registered!");
  }


  // ─── QR CODE & BARCODE SCANNER & TRANSITION AUDIT REPORT ─────────────
  
  shareOnWhatsApp(trackingId) {
    const sample = this.data.soilSamples.find(s => s.trackingId === trackingId);
    if (!sample) return;

    const isTested = sample.isTested || sample.status === "Tested" || sample.status === "Advisory Sent";
    const msg = "*Arkashine Soil Collection Centre Test Certificate & Advisory*\n" +
      "• Tracking ID: " + sample.trackingId + "\n" +
      "• Farmer Name: " + sample.farmerName + "\n" +
      "• Village: " + sample.village + "\n" +
      "• Origin Handed By: " + (sample.collectedBy || 'Village Partner') + "\n" +
      "• Picked By (Runner): " + (sample.pickedByRunner || 'Chetan Kumar') + "\n" +
      "• Destination Facility: " + (sample.destinationCentreName || 'Central Lab') + "\n" +
      "• Tested By (Chemist): " + (sample.testedBy || 'Chief Analyst') + "\n" +
      "• Batch & Bag: " + (sample.batchName || 'Batch 1 Samples (Bag 1)') + "\n" +
      "• Test Status: " + (isTested ? '✔ TESTED & CERTIFIED' : '❌ PENDING TEST') + "\n" +
      (sample.advisoryNote ? ("• Advisory: " + sample.advisoryNote + "\n") : "") +
      "\nArkashine Soil Collection Centre Tracking System";

    const cleanPhone = sample.farmerPhone ? sample.farmerPhone.replace(/\D/g, '') : '';
    const phoneWithCountry = cleanPhone.length === 10 ? ("91" + cleanPhone) : cleanPhone;
    const waUrl = "https://wa.me/" + phoneWithCountry + "?text=" + encodeURIComponent(msg);

    window.open(waUrl, '_blank');
  }

  previewCardForSample(trackingId) {
    this.loadExistingTicket(trackingId, 4);
    document.getElementById("printable-card-container")?.scrollIntoView({ behavior: 'smooth' });
  }
}

// Global App Initialization
var app = null;
function initArkashineApp() {
  try {
    app = new ArkashineApp();
    window.app = app;
    app.render();
    console.log("Arkashine Soil Collection Centre Dashboard v4.1 initialized successfully!");
  } catch (e) {
    console.error("Error during ArkashineApp initialization:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArkashineApp);
} else {
  initArkashineApp();
}

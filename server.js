const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Pool } = require('pg');

const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, 'data.json');
const DATABASE_URL = process.env.DATABASE_URL;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const DEFAULT_SERVER_DATA = {
  villages: [
    "Harohalli", "Bidadi", "Nelamangala", "Kunigal", "Magadi",
    "Channapatna", "Ramanagara", "Maddur", "Mandya", "Malavalli",
    "Kanakapura", "Tavarekere", "Devanahalli", "Doddaballapura", "Hosakote",
    "Anekal", "Kengeri", "Jigani", "Attibele", "Sarjapura",
    "Vijayapura", "Solur", "Kudur", "Maralawadi", "Kailancha",
    "Uyyamballi", "Satanur", "Kasaba", "Halagur", "Koppa",
    "Bellur", "Nagamangala", "Pandavapura", "Srirangapatna", "Krishnarajpet",
    "Gubbi", "Tumkur", "Sira", "Tiptur", "Turuvekere"
  ],
  shops: [
  {
    "id": "SHP-01",
    "phone": "9793583968",
    "address": "Basari, Chheda, Barabanki",
    "village": "Basari, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Bablu chauhan",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-02",
    "phone": "9956988300",
    "address": "Bhagwati pur, Rampur Mathura Sitapur",
    "village": "Rampur Mathura, Sitapur",
    "category": "Retail Soil Partner",
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Ramlalhan chauhan",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-03",
    "phone": "7754804253",
    "address": "Lalapur, Rampur Mathura, Sitapur",
    "village": "Lalapur, Sitapur",
    "category": "Retail Soil Partner",
    "shopName": "Gurusahay beej Bhandar",
    "shopkeeper": "C. B. Singh",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-04",
    "phone": "9129931100",
    "address": "Naharval, Rampur Mathura, Sitapur",
    "village": "Naharval, Sitapur",
    "category": "Retail Soil Partner",
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Anupam chahan",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-05",
    "phone": "9793068860",
    "address": "Mohammad pur khala, Barabanki",
    "village": "Mohammad pur khala",
    "category": "Retail Soil Partner",
    "shopName": "Maurya beej Bhandar",
    "shopkeeper": "Ajay maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-06",
    "phone": "9839788393",
    "address": "Belahara, Fatehpur, Barabanki",
    "village": "Belahara, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Kishan beej Bhandar",
    "shopkeeper": "Rahmat Ali",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-07",
    "phone": "7607676794",
    "address": "Sauranha, Belahara, Barabanki",
    "village": "Sauranha, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Patel krishi sewa Kendra",
    "shopkeeper": "Pradeep verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-08",
    "phone": "9918731064",
    "address": "Bihura, Fatehpur Barabanki",
    "village": "Bihura, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Siri Bala ji beej Bhandar",
    "shopkeeper": "Amit Kumar",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-09",
    "phone": "8172914793",
    "address": "Kheriya, Fatehpur Barabanki",
    "village": "Kheriya, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Chaudhary khad bhandar",
    "shopkeeper": "Ramprasad",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-10",
    "phone": "9454278941",
    "address": "Mohammad pur khala Fatehpur Barabanki",
    "village": "Mohammad pur khala",
    "category": "Retail Soil Partner",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Sudhakar verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-11",
    "phone": "9455731367",
    "address": "Suratganj Barabanki",
    "village": "Suratganj, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Kisan Seva Kendra",
    "shopkeeper": "Umakant Verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-12",
    "phone": "9120664765",
    "address": "Imalipur Suratganj Barabanki",
    "village": "Imalipur, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Atul Verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-13",
    "phone": "9415530494",
    "address": "Suratganj Barabanki",
    "village": "Suratganj, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Surendra Verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-14",
    "phone": "9651743318",
    "address": "Bishanpur Deva Barabanki",
    "village": "Bishanpur Deva, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Khan bij Bhandar",
    "shopkeeper": "Rukhsar Ahmed",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-15",
    "phone": "9554431900",
    "address": "Bishanpur Deva Barabanki",
    "village": "Bishanpur Deva, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Lodhi beej Bhandar",
    "shopkeeper": "Mansingh Lodhi",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-16",
    "phone": "9454915474",
    "address": "Fatehpur, Barabanki",
    "village": "Fatehpur, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Rajput beej Bhandar",
    "shopkeeper": "Neelu Rajput",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-17",
    "phone": "6307091791",
    "address": "Masauli Barabanki",
    "village": "Masauli, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Krishi Raksha ikai",
    "shopkeeper": "Vijay Kumar",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-18",
    "phone": "7800560090",
    "address": "Masauli Barabanki",
    "village": "Masauli, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Nitesh khad Bhandar",
    "shopkeeper": "Nitesh Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-19",
    "phone": "9839535352",
    "address": "Gangavala Tahsil Fatehpur Barabanki",
    "village": "Gangavala, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Goswami pesticides",
    "shopkeeper": "Goswami",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-20",
    "phone": "9839455247",
    "address": "Fatehpur Barabanki",
    "village": "Fatehpur, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "National khad Bhandar",
    "shopkeeper": "Mohammed Arif",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-21",
    "phone": "8957643479",
    "address": "Mohammadpur khala Fatehpur Barabanki",
    "village": "Mohammadpur khala",
    "category": "Retail Soil Partner",
    "shopName": "Kisan bij Bhandar",
    "shopkeeper": "Dinesh Verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-22",
    "phone": "9838177714",
    "address": "BEL Chauraha, Suratganj Barabanki",
    "village": "BEL Chauraha, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Vishnu khad Bhandar",
    "shopkeeper": "Shivkant Gupta",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-23",
    "phone": "9793654192",
    "address": "Belhara, Fatehpur Barabanki",
    "village": "Belhara, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Balaji traders",
    "shopkeeper": "Kuldeep Singh",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-24",
    "phone": "8737921680",
    "address": "Colonelganj, Gonda",
    "village": "Colonelganj, Gonda",
    "category": "Retail Soil Partner",
    "shopName": "Maurya beej Bhandar",
    "shopkeeper": "Vishal Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-25",
    "phone": "8601234282",
    "address": "Colonelganj, Gonda",
    "village": "Colonelganj, Gonda",
    "category": "Retail Soil Partner",
    "shopName": "Kisan bij Bhandar",
    "shopkeeper": "Himanshu Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-26",
    "phone": "8922900098",
    "address": "Jarwal kasba Bahraich",
    "village": "Jarwal kasba, Bahraich",
    "category": "Retail Soil Partner",
    "shopName": "Kisan Seva Kendra",
    "shopkeeper": "Mohammed Aslam",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-27",
    "phone": "8115940901",
    "address": "Jarwal kasba, Bahraich",
    "village": "Jarwal kasba, Bahraich",
    "category": "Retail Soil Partner",
    "shopName": "Jiya Khad Bhandar",
    "shopkeeper": "Vasi Ahmad",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-28",
    "phone": "8564960563",
    "address": "Mahadeva Ramnagar",
    "village": "Mahadeva, Ramnagar",
    "category": "Retail Soil Partner",
    "shopName": "Verma traders",
    "shopkeeper": "Aniruddh Kumar",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-29",
    "phone": "7318180173",
    "address": "Jarwal road, Bahraich",
    "village": "Jarwal road, Bahraich",
    "category": "Retail Soil Partner",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Amrendra Verma",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-30",
    "phone": "9838480151",
    "address": "Chhatauni Chauraha, Jarwal road Gonda",
    "village": "Chhatauni Chauraha, Gonda",
    "category": "Retail Soil Partner",
    "shopName": "Maurya krishi Seva Kendra",
    "shopkeeper": "Ankit Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-31",
    "phone": "9454048950",
    "address": "Mohammadpur khala, Fatehpur Barabanki",
    "village": "Mohammadpur khala",
    "category": "Retail Soil Partner",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Amit Kumar",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-32",
    "phone": "8858753668",
    "address": "Jasmanda, Barabanki",
    "village": "Jasmanda, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Kalika prasad Krishi sewa Kendra",
    "shopkeeper": "Akash Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-33",
    "phone": "9839823447",
    "address": "Shishepara, Dewa, Barabanki",
    "village": "Shishepara, Barabanki",
    "category": "Retail Soil Partner",
    "shopName": "Kishan sahayata Kendra",
    "shopkeeper": "Shrichand Maurya",
    "samplesCollected": 0,
    "createdBy": "Mukesh"
  },
  {
    "id": "SHP-S01",
    "shopName": "Kamal Traders Belhara",
    "shopkeeper": "Kamal Traders",
    "phone": "8874197491",
    "category": "Retail Soil Partner",
    "village": "Belhara, Fatehpur, Barabanki",
    "address": "Belhara Town, Fatehpur, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S02",
    "shopName": "M/s Kisan Enterprises Nayapur",
    "shopkeeper": "Kisan Enterprises",
    "phone": "9935453672",
    "category": "Retail Soil Partner",
    "village": "Nayapur, Barabanki",
    "address": "Nayapur Chauraha / Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S03",
    "shopName": "Verma Traders Murliganj",
    "shopkeeper": "Verma Traders",
    "phone": "7355781483",
    "category": "Retail Soil Partner",
    "village": "Murliganj, Haidergarh, Barabanki",
    "address": "Murliganj, Sidhaur / Haidergarh Road, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S04",
    "shopName": "Saurabh Khad Bhandar",
    "shopkeeper": "Saurabh",
    "phone": "9794649165",
    "category": "Retail Soil Partner",
    "village": "Baddupur, Fatehpur, Barabanki",
    "address": "Main Chauraha, Baddupur, Fatehpur, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S05",
    "shopName": "Yashi Traders",
    "shopkeeper": "Yashi Traders",
    "phone": "7985702563",
    "category": "Retail Soil Partner",
    "village": "Sihali, Ramnagar, Barabanki",
    "address": "Sihali Chauraha, Ramnagar, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S06",
    "shopName": "New Verma Khad Bhandar",
    "shopkeeper": "Verma",
    "phone": "9936729137",
    "category": "Retail Soil Partner",
    "village": "Dewa Sharif, Barabanki",
    "address": "Dewa Town / Dewa Sharif, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S07",
    "shopName": "Awadhesh Khad Bhandar",
    "shopkeeper": "Awadhesh",
    "phone": "9794805948",
    "category": "Retail Soil Partner",
    "village": "Haidergarh, Barabanki",
    "address": "Haidergarh Town / Main Bazar, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S08",
    "shopName": "Ankur Khad Bhandar",
    "shopkeeper": "Ankur",
    "phone": "9956980519",
    "category": "Retail Soil Partner",
    "village": "Bhitariya, Ramsanehighat, Barabanki",
    "address": "Bhitariya / Nawabganj Area, Ramsanehighat, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S09",
    "shopName": "Raman Trading Company",
    "shopkeeper": "Raman",
    "phone": "9450311280",
    "category": "Retail Soil Partner",
    "village": "Banki Rural, Barabanki",
    "address": "Dhanokhar Chauraha / Rasulpur Road, Banki, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S10",
    "shopName": "M/s Anand Krishi Seva Kendra",
    "shopkeeper": "Anand",
    "phone": "9026208092",
    "category": "Retail Soil Partner",
    "village": "Gobaraha, Palta Dewa, Barabanki",
    "address": "Palta Dewa, NH-727H Road, Gobaraha, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S11",
    "shopName": "Shri Sai Traders",
    "shopkeeper": "Sai Traders",
    "phone": "8299157703",
    "category": "Retail Soil Partner",
    "village": "Lakhpedabagh, Nawabganj, Barabanki",
    "address": "Near MB College, Lakhpedabagh, Nawabganj, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S12",
    "shopName": "Shree Narayan Enterprises",
    "shopkeeper": "Narayan Enterprises",
    "phone": "8765163450",
    "category": "Retail Soil Partner",
    "village": "Naka Satrikh, Barabanki",
    "address": "Naka Paisar, Naka Satrikh Road, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S13",
    "shopName": "Maurya Beej Bhandar",
    "shopkeeper": "Maurya",
    "phone": "6386931363",
    "category": "Retail Soil Partner",
    "village": "Banki, Ramnagar Road, Barabanki",
    "address": "Maurya Market, Rampur Mathura Road / Banki, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S14",
    "shopName": "Avadh Krishi Sewa Kendra",
    "shopkeeper": "Avadh Krishi Kendra",
    "phone": "9005140611",
    "category": "Retail Soil Partner",
    "village": "Sahadatganj, Satrikh, Barabanki",
    "address": "Sahadatganj / Satrikh Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S15",
    "shopName": "Maurya Traders",
    "shopkeeper": "Maurya Traders",
    "phone": "9956482586",
    "category": "Retail Soil Partner",
    "village": "Dewa Road, Barabanki",
    "address": "Deoria / Dewa Road, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S16",
    "shopName": "Anuj Khad Bhandar",
    "shopkeeper": "Anuj",
    "phone": "9721416502",
    "category": "Retail Soil Partner",
    "village": "Fatehpur, Banki Circle, Barabanki",
    "address": "Bhagauli / Katghara Road, Fatehpur-Nawabganj, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S17",
    "shopName": "M/s Atul Trading Company",
    "shopkeeper": "Atul",
    "phone": "8601407550",
    "category": "Retail Soil Partner",
    "village": "Nawabganj Town, Barabanki",
    "address": "Barabanki Urban Town Area, Nawabganj",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S18",
    "shopName": "Rahul Pesticide and Beej Bhandar",
    "shopkeeper": "Rahul",
    "phone": "8960975321",
    "category": "Retail Soil Partner",
    "village": "Nawabganj Town, Barabanki",
    "address": "Main Bazar, Barabanki Sadar, Nawabganj",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S19",
    "shopName": "Pooja Keetnashak Evm Beej Bhandar",
    "shopkeeper": "Pooja",
    "phone": "8299870847",
    "category": "Retail Soil Partner",
    "village": "Nawabganj Town, Barabanki",
    "address": "Krishi Mandi Area, Barabanki Sadar, Nawabganj",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S20",
    "shopName": "Yadav Khad Bhandar",
    "shopkeeper": "Yadav",
    "phone": "7905822646",
    "category": "Retail Soil Partner",
    "village": "Dariyabad, Barabanki Rural",
    "address": "Barabanki Rural Area, Dariyabad",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S21",
    "shopName": "Guru Kripa Krishi Sewa Kendra",
    "shopkeeper": "Guru Kripa",
    "phone": "9628033136",
    "category": "Retail Soil Partner",
    "village": "Fatehpur / Barabanki Sadar",
    "address": "Barabanki District Centre, Fatehpur",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S22",
    "shopName": "Sidhart Agro Chem Ind",
    "shopkeeper": "Sidhart",
    "phone": "9794448902",
    "category": "Retail Soil Partner",
    "village": "Industrial Area, Barabanki",
    "address": "Barabanki Industrial / Urban Area",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S23",
    "shopName": "Patel Fertilizer",
    "shopkeeper": "Patel",
    "phone": "9026465571",
    "category": "Retail Soil Partner",
    "village": "Banki, Haidergarh Road, Barabanki",
    "address": "Haidergarh Road / Patel Nagar, Banki, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S24",
    "shopName": "Jaidy Khad Bhandar",
    "shopkeeper": "Jaidy",
    "phone": "9918821677",
    "category": "Retail Soil Partner",
    "village": "Zaidpur, Sidhaur, Barabanki",
    "address": "Zaidpur Town, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S25",
    "shopName": "Ambrish Khad Bhandar",
    "shopkeeper": "Ambrish",
    "phone": "7897242297",
    "category": "Retail Soil Partner",
    "village": "Suratganj, Fatehpur, Barabanki",
    "address": "Barabanki Rural Circle, Suratganj",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S26",
    "shopName": "Shree Ram Traders",
    "shopkeeper": "Shree Ram Traders",
    "phone": "8795657933",
    "category": "Retail Soil Partner",
    "village": "Ramnagar, Mahadeva Circle, Barabanki",
    "address": "Mahadeva Circle, Ramnagar, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-S27",
    "shopName": "Pandey Khad Bhandar",
    "shopkeeper": "Pandey",
    "phone": "9315481133",
    "category": "Retail Soil Partner",
    "village": "Fatehpur, Kursi Circle, Barabanki",
    "address": "Kursi Circle, Fatehpur, Barabanki Rural",
    "createdBy": "Shivam",
    "samplesCollected": 0
  }
],
  testingCentres: [
    { id: "TC-CENTRAL", name: "Arkashine Central Diagnostic Lab", type: "Arkashine Central Lab", machineSerial: "ARK-CENTRAL-LAB-01", operatorName: "Dr. Vignesh Shastry (Chief Analyst)", operatorPhone: "9880011223", location: "Bengaluru Central Diagnostic Hub", dateDeployed: "2026-01-10", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-101", name: "Field Unit 1 - Ramanagara Machine Station", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M04", operatorName: "Anand Murthy (Field Chemist)", operatorPhone: "9880022334", location: "APMC Complex, Ramanagara", dateDeployed: "2026-03-15", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-102", name: "Field Unit 2 - Mandya Mobile Testing Centre", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M09", operatorName: "Pooja Hegde (Testing Executive)", operatorPhone: "9880033445", location: "Near Sugar Factory Circle, Mandya", dateDeployed: "2026-05-20", status: "Active", totalTestsCount: 0 }
  ],
  farmers: [],
  soilSamples: [],
  users: [
    {
      id: "USR-ADMIN",
      fullName: "Operations Admin",
      username: "admin",
      phone: "9845011223",
      role: "Operations Manager",
      password: "password123",
      createdAt: "2026-10-29"
    }
  ]
};

function sanitizeServerData(obj) {
  if (!obj || typeof obj !== 'object') obj = JSON.parse(JSON.stringify(DEFAULT_SERVER_DATA));
  if (!obj.users || obj.users.length === 0) {
    obj.users = JSON.parse(JSON.stringify(DEFAULT_SERVER_DATA.users));
  }
  if (obj.shops) {
    obj.shops = obj.shops.filter(s => s.shopName !== "xyz" && !["SHP-101", "SHP-102", "SHP-103", "SHP-201", "SHP-202", "SHP-203"].includes(s.id));
  }
  return obj;
}

// Ensure data.json exists locally as disk backup
try {
  let initial = null;
  if (fs.existsSync(DATA_FILE)) {
    try { initial = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch(e) {}
  }
  initial = sanitizeServerData(initial);
  fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
} catch(e) {}

// ─── NEON DATABASE SETUP ────────────────────────────────────────────────
let dbPool = null;

if (DATABASE_URL) {
  try {
    dbPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    dbPool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).then(() => {
      console.log('✅ Connected to Neon Database! Permanent storage active.');
      return dbPool.query("SELECT id FROM app_state WHERE id = 'arkashine_central'");
    }).then(res => {
      if (res && res.rows.length === 0) {
        let initData = DEFAULT_SERVER_DATA;
        if (fs.existsSync(DATA_FILE)) {
          try { initData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e) {}
        }
        return dbPool.query(
          "INSERT INTO app_state (id, data, updated_at) VALUES ('arkashine_central', $1, CURRENT_TIMESTAMP)",
          [initData]
        );
      }
    }).catch(err => {
      console.error('⚠️ Neon Database init error:', err.message);
    });
  } catch (e) {
    console.error('⚠️ Failed to initialize Neon Pool:', e.message);
  }
} else {
  console.log('ℹ️ Running without DATABASE_URL: using local data.json fallback.');
}

function serveFromDisk(res) {
  try {
    let dataObj = null;
    if (fs.existsSync(DATA_FILE)) {
      dataObj = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    dataObj = sanitizeServerData(dataObj);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dataObj));
  } catch (err) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(DEFAULT_SERVER_DATA));
  }
}

const server = http.createServer((req, res) => {
  // Global CORS & No-Cache Headers (Ensures all devices always get latest data)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // ─── API: GET /api/status (Diagnostic & Neon DB Health Check) ────────
  if (req.method === 'GET' && parsedUrl === '/api/status') {
    if (dbPool) {
      dbPool.query('SELECT NOW() as current_time, COUNT(*) as rows FROM app_state')
        .then(result => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'online',
            database: 'Neon PostgreSQL (Active & Connected)',
            dbTime: result.rows[0].current_time,
            persistedRows: result.rows[0].rows,
            permanentStorage: 'Active (Never deletes on sleep or restart)'
          }));
        })
        .catch(err => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'online',
            database: 'Neon connection error',
            error: err.message,
            fallback: 'Local Disk Active'
          }));
        });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      database: 'Local Disk (Fallback)',
      neonStatus: 'Waiting for DATABASE_URL environment variable in Render Dashboard',
      instruction: 'Add DATABASE_URL in Render Dashboard -> Environment to activate Neon PostgreSQL'
    }));
    return;
  }

  // ─── API: GET /api/data (Central Database Read) ──────────────────────
  if (req.method === 'GET' && parsedUrl === '/api/data') {
    if (dbPool) {
      dbPool.query("SELECT data FROM app_state WHERE id = 'arkashine_central'")
        .then(result => {
          if (result.rows.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0].data));
          } else {
            serveFromDisk(res);
          }
        })
        .catch(err => {
          console.error("Neon read error, falling back to disk:", err.message);
          serveFromDisk(res);
        });
      return;
    }

    serveFromDisk(res);
    return;
  }

  // ─── API: POST /api/data (Central Database Write) ─────────────────────
  if (req.method === 'POST' && parsedUrl === '/api/data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e7) req.connection.destroy(); // 20MB limit
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);

        // Save local backup file
        try { fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8'); } catch(e) {}

        if (dbPool) {
          dbPool.query(`
            INSERT INTO app_state (id, data, updated_at)
            VALUES ('arkashine_central', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP;
          `, [parsed])
          .then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, storage: 'neon_postgres', timestamp: new Date().toISOString() }));
          })
          .catch(err => {
            console.error("Neon write error:", err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, storage: 'disk_fallback', timestamp: new Date().toISOString() }));
          });
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, storage: 'disk', timestamp: new Date().toISOString() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // ─── STATIC FILE SERVING ──────────────────────────────────────────────
  let reqPath = parsedUrl === '/' ? '/index.html' : parsedUrl;
  let filePath = path.join(__dirname, reqPath);
  let ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`=======================================================`);
  console.log(` Arkashine Soil Collection Centre Tracking Dashboard`);
  console.log(` Server running on port: ${PORT}`);
  console.log(` Shared Central API Endpoint : http://localhost:${PORT}/api/data`);
  console.log(` Neon Database: ${DATABASE_URL ? 'CONFIGURED (Cloud Persistence Active)' : 'Not configured (Local Disk Mode)'}`);
  console.log(` Local URL : ${url}`);
  console.log(`=======================================================`);
  
  if (!process.env.PORT && !process.env.RENDER) {
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`, () => {});
  }
});

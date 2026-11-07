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
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Bablu chauhan",
    "phone": "9793583968",
    "category": "Retail Soil Partner",
    "village": "Basari, Barabanki",
    "address": "Basari, Chheda, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-02",
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Ramlalhan chauhan",
    "phone": "9956988300",
    "category": "Retail Soil Partner",
    "village": "Rampur Mathura, Sitapur",
    "address": "Bhagwati pur, Rampur Mathura Sitapur",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-03",
    "shopName": "Gurusahay beej Bhandar",
    "shopkeeper": "C. B. Singh",
    "phone": "7754804253",
    "category": "Retail Soil Partner",
    "village": "Lalapur, Sitapur",
    "address": "Lalapur, Rampur Mathura, Sitapur",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-04",
    "shopName": "Chauhan beej Bhandar",
    "shopkeeper": "Anupam chahan",
    "phone": "9129931100",
    "category": "Retail Soil Partner",
    "village": "Naharval, Sitapur",
    "address": "Naharval, Rampur Mathura, Sitapur",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-05",
    "shopName": "Maurya beej Bhandar",
    "shopkeeper": "Ajay maurya",
    "phone": "9793068860",
    "category": "Retail Soil Partner",
    "village": "Mohammad pur khala",
    "address": "Mohammad pur khala, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-06",
    "shopName": "Kishan beej Bhandar",
    "shopkeeper": "Rahmat Ali",
    "phone": "9839788393",
    "category": "Retail Soil Partner",
    "village": "Belahara, Barabanki",
    "address": "Belahara, Fatehpur, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-07",
    "shopName": "Patel krishi sewa Kendra",
    "shopkeeper": "Pradeep verma",
    "phone": "7607676794",
    "category": "Retail Soil Partner",
    "village": "Sauranha, Barabanki",
    "address": "Sauranha, Belahara, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-08",
    "shopName": "Siri Bala ji beej Bhandar",
    "shopkeeper": "Amit Kumar",
    "phone": "9918731064",
    "category": "Retail Soil Partner",
    "village": "Bihura, Barabanki",
    "address": "Bihura, Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-09",
    "shopName": "Chaudhary khad bhandar",
    "shopkeeper": "Ramprasad",
    "phone": "8172914793",
    "category": "Retail Soil Partner",
    "village": "Kheriya, Barabanki",
    "address": "Kheriya, Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-10",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Sudhakar verma",
    "phone": "9454278941",
    "category": "Retail Soil Partner",
    "village": "Mohammad pur khala",
    "address": "Mohammad pur khala Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-11",
    "shopName": "Kisan Seva Kendra",
    "shopkeeper": "Umakant Verma",
    "phone": "9455731367",
    "category": "Retail Soil Partner",
    "village": "Suratganj, Barabanki",
    "address": "Suratganj Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-12",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Atul Verma",
    "phone": "9120664765",
    "category": "Retail Soil Partner",
    "village": "Imalipur, Barabanki",
    "address": "Imalipur Suratganj Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-13",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Surendra Verma",
    "phone": "9415530494",
    "category": "Retail Soil Partner",
    "village": "Suratganj, Barabanki",
    "address": "Suratganj Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-14",
    "shopName": "Khan bij Bhandar",
    "shopkeeper": "Rukhsar Ahmed",
    "phone": "9651743318",
    "category": "Retail Soil Partner",
    "village": "Bishanpur Deva, Barabanki",
    "address": "Bishanpur Deva Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-15",
    "shopName": "Lodhi beej Bhandar",
    "shopkeeper": "Mansingh Lodhi",
    "phone": "9554431900",
    "category": "Retail Soil Partner",
    "village": "Bishanpur Deva, Barabanki",
    "address": "Bishanpur Deva Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-16",
    "shopName": "Rajput beej Bhandar",
    "shopkeeper": "Neelu Rajput",
    "phone": "9454915474",
    "category": "Retail Soil Partner",
    "village": "Fatehpur, Barabanki",
    "address": "Fatehpur, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-17",
    "shopName": "Krishi Raksha ikai",
    "shopkeeper": "Vijay Kumar",
    "phone": "6307091791",
    "category": "Retail Soil Partner",
    "village": "Masauli, Barabanki",
    "address": "Masauli Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-18",
    "shopName": "Nitesh khad Bhandar",
    "shopkeeper": "Nitesh Maurya",
    "phone": "7800560090",
    "category": "Retail Soil Partner",
    "village": "Masauli, Barabanki",
    "address": "Masauli Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-19",
    "shopName": "Goswami pesticides",
    "shopkeeper": "Goswami",
    "phone": "9839535352",
    "category": "Retail Soil Partner",
    "village": "Gangavala, Barabanki",
    "address": "Gangavala Tahsil Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-20",
    "shopName": "National khad Bhandar",
    "shopkeeper": "Mohammed Arif",
    "phone": "9839455247",
    "category": "Retail Soil Partner",
    "village": "Fatehpur, Barabanki",
    "address": "Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-21",
    "shopName": "Kisan bij Bhandar",
    "shopkeeper": "Dinesh Verma",
    "phone": "8957643479",
    "category": "Retail Soil Partner",
    "village": "Mohammadpur khala",
    "address": "Mohammadpur khala Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-22",
    "shopName": "Vishnu khad Bhandar",
    "shopkeeper": "Shivkant Gupta",
    "phone": "9838177714",
    "category": "Retail Soil Partner",
    "village": "BEL Chauraha, Barabanki",
    "address": "BEL Chauraha, Suratganj Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-23",
    "shopName": "Balaji traders",
    "shopkeeper": "Kuldeep Singh",
    "phone": "9793654192",
    "category": "Retail Soil Partner",
    "village": "Belhara, Barabanki",
    "address": "Belhara, Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-24",
    "shopName": "Maurya beej Bhandar",
    "shopkeeper": "Vishal Maurya",
    "phone": "8737921680",
    "category": "Retail Soil Partner",
    "village": "Colonelganj, Gonda",
    "address": "Colonelganj, Gonda",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-25",
    "shopName": "Kisan bij Bhandar",
    "shopkeeper": "Himanshu Maurya",
    "phone": "8601234282",
    "category": "Retail Soil Partner",
    "village": "Colonelganj, Gonda",
    "address": "Colonelganj, Gonda",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-26",
    "shopName": "Kisan Seva Kendra",
    "shopkeeper": "Mohammed Aslam",
    "phone": "8922900098",
    "category": "Retail Soil Partner",
    "village": "Jarwal kasba, Bahraich",
    "address": "Jarwal kasba Bahraich",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-27",
    "shopName": "Jiya Khad Bhandar",
    "shopkeeper": "Vasi Ahmad",
    "phone": "8115940901",
    "category": "Retail Soil Partner",
    "village": "Jarwal kasba, Bahraich",
    "address": "Jarwal kasba, Bahraich",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-28",
    "shopName": "Verma traders",
    "shopkeeper": "Aniruddh Kumar",
    "phone": "8564960563",
    "category": "Retail Soil Partner",
    "village": "Mahadeva, Ramnagar",
    "address": "Mahadeva Ramnagar",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-29",
    "shopName": "Verma beej Bhandar",
    "shopkeeper": "Amrendra Verma",
    "phone": "7318180173",
    "category": "Retail Soil Partner",
    "village": "Jarwal road, Bahraich",
    "address": "Jarwal road, Bahraich",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-30",
    "shopName": "Maurya krishi Seva Kendra",
    "shopkeeper": "Ankit Maurya",
    "phone": "9838480151",
    "category": "Retail Soil Partner",
    "village": "Chhatauni Chauraha, Gonda",
    "address": "Chhatauni Chauraha, Jarwal road Gonda",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-31",
    "shopName": "Burma bij Bhandar",
    "shopkeeper": "Amit Kumar",
    "phone": "9454048950",
    "category": "Retail Soil Partner",
    "village": "Mohammadpur khala",
    "address": "Mohammadpur khala, Fatehpur Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-32",
    "shopName": "Kalika prasad Krishi sewa Kendra",
    "shopkeeper": "Akash Maurya",
    "phone": "8858753668",
    "category": "Retail Soil Partner",
    "village": "Jasmanda, Barabanki",
    "address": "Jasmanda, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
  },
  {
    "id": "SHP-33",
    "shopName": "Kishan sahayata Kendra",
    "shopkeeper": "Shrichand Maurya",
    "phone": "9839823447",
    "category": "Retail Soil Partner",
    "village": "Shishepara, Barabanki",
    "address": "Shishepara, Dewa, Barabanki",
    "createdBy": "Mukesh",
    "samplesCollected": 0
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
  },
  {
    "id": "SHP-OD01",
    "shopName": "Kisan Seva Kendra",
    "shopkeeper": "Kisan Seva Kendra In-Charge",
    "phone": "7007161361",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD02",
    "shopName": "Kisan Sewa Kendra",
    "shopkeeper": "Kisan Sewa Kendra In-Charge",
    "phone": "6387467537",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD03",
    "shopName": "M/s Deepu Khad Bhandar",
    "shopkeeper": "Deepu",
    "phone": "7007642657",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD04",
    "shopName": "Anjani Khad Bhandar",
    "shopkeeper": "Anjani",
    "phone": "9455573679",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD05",
    "shopName": "Agri Clinics And Business Centre",
    "shopkeeper": "Agri Clinic In-Charge",
    "phone": "8172820528",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD06",
    "shopName": "Verma Krishi Sewa Kendra",
    "shopkeeper": "Verma",
    "phone": "8299424999",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD07",
    "shopName": "Agri Clinic And Agri Business",
    "shopkeeper": "Agri Business In-Charge",
    "phone": "6306422286",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD08",
    "shopName": "Gupta Fertilizer",
    "shopkeeper": "Gupta",
    "phone": "9935993776",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD09",
    "shopName": "Verma Khad Bhandar",
    "shopkeeper": "Verma",
    "phone": "8052406871",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD10",
    "shopName": "Kisan Dream Centre",
    "shopkeeper": "Kisan Dream Centre In-Charge",
    "phone": "8318564161",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD11",
    "shopName": "Kishan Sewa Kendra",
    "shopkeeper": "Kishan Sewa In-Charge",
    "phone": "9918211571",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD12",
    "shopName": "Utkarsh Khad Bhandar",
    "shopkeeper": "Utkarsh",
    "phone": "6393421581",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD13",
    "shopName": "Shivam Kisan Sewa Kendra",
    "shopkeeper": "Shivam",
    "phone": "9076502873",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD14",
    "shopName": "Uttam Krishi Sewa Kendra",
    "shopkeeper": "Uttam",
    "phone": "9721156083",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD15",
    "shopName": "Kishan Khad Bhandar",
    "shopkeeper": "Kishan Khad In-Charge",
    "phone": "9451531463",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD16",
    "shopName": "Shiba Kisan Sewa Kendra",
    "shopkeeper": "Shiba",
    "phone": "9120047043",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD17",
    "shopName": "Yadav Khad Bhandar",
    "shopkeeper": "Yadav",
    "phone": "9838786936",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
    "createdBy": "Shivam",
    "samplesCollected": 0
  },
  {
    "id": "SHP-OD18",
    "shopName": "Laki Khad Bhandar",
    "shopkeeper": "Laki",
    "phone": "9651179976",
    "category": "Retail Soil Partner",
    "village": "Barabanki Town, Barabanki",
    "address": "Main Bazar / Town Area, Barabanki",
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

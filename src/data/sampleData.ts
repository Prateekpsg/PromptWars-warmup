import { AirQualityReading } from "@/types/airQuality";

// Synthetic Ward Datasets for BhopalAIR demonstration
export const SAMPLE_WARD_DATASET_CSV = `timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes
2026-11-14 06:00,MP Nagar Zone-I Commercial Hub,265,340,312,68,18,65,Peak morning diesel truck & transit idling
2026-11-14 06:00,Arera Colony Residential Enclave,85,120,135,28,19,62,Moderate tree cover and lake breeze
2026-11-14 06:00,Hamidia Hospital & Medical Zone,115,165,160,35,18,64,Ambulance corridor & drop-off zone
2026-11-14 06:00,Govindpura Industrial Area Phase II,380,490,410,112,20,55,Boiler stack emissions & fabrication
2026-11-14 09:00,MP Nagar Zone-I Commercial Hub,290,380,335,74,22,58,Traffic congestion spike at Chetak Bridge
2026-11-14 09:00,Arera Colony Residential Enclave,92,130,142,32,23,56,Domestic sweepers
2026-11-14 09:00,Hamidia Hospital & Medical Zone,170,225,210,48,22,57,Heavy OPD patient transit flow
2026-11-14 09:00,Govindpura Industrial Area Phase II,410,530,435,125,24,50,Continuous heavy freight transport
2026-11-14 12:00,MP Nagar Zone-I Commercial Hub,210,290,265,58,28,45,Sunlight dispersion improving
2026-11-14 12:00,Arera Colony Residential Enclave,70,105,115,22,29,43,Clear
2026-11-14 12:00,Hamidia Hospital & Medical Zone,120,175,170,30,28,44,Post lunch session
2026-11-14 12:00,Govindpura Industrial Area Phase II,350,470,385,98,30,38,Open solid waste burning spotted near perimeter
2026-11-14 15:00,MP Nagar Zone-I Commercial Hub,240,320,290,62,29,42,Afternoon commercial delivery rush
2026-11-14 15:00,Arera Colony Residential Enclave,75,110,122,25,30,41,Normal
2026-11-14 15:00,Hamidia Hospital & Medical Zone,195,250,230,52,29,42,Dispersal traffic queue
2026-11-14 15:00,Govindpura Industrial Area Phase II,430,560,455,130,31,37,Unpaved road dust swirl
`;

export const SAMPLE_HISTORICAL_DATASET_CSV = `timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes
2026-11-13 06:00,MP Nagar Zone-I Commercial Hub,210,290,260,55,19,68,Previous baseline
2026-11-13 06:00,Arera Colony Residential Enclave,70,100,110,24,20,66,Clear
2026-11-13 06:00,Hamidia Hospital & Medical Zone,95,140,140,28,19,67,Normal
2026-11-13 06:00,Govindpura Industrial Area Phase II,310,420,360,95,21,58,Standard operational load
2026-11-13 12:00,MP Nagar Zone-I Commercial Hub,180,240,230,48,27,48,Clear
2026-11-13 12:00,Arera Colony Residential Enclave,60,90,95,20,28,46,Clear
2026-11-13 12:00,Hamidia Hospital & Medical Zone,100,150,150,26,27,47,Clear
2026-11-13 12:00,Govindpura Industrial Area Phase II,290,400,340,88,29,40,Clear
`;

export const PRESET_DATASETS = [
  {
    id: "sample-bhopal-ward",
    name: "Bhopal Central & Industrial Corridor (Govindpura, MP Nagar, Arera)",
    description: "Multi-point sensor array covering MP Nagar, Govindpura Industrial Phase II, and Arera Colony.",
    data: SAMPLE_WARD_DATASET_CSV,
  },
  {
    id: "sample-school-focus",
    name: "Bhopal Education & Campus Air Matrix",
    description: "Focus on pickup/drop-off hours, playground exposure thresholds, and NO2 surges.",
    data: `timestamp,location,pm25,pm10,aqi,no2,temperature,humidity,notes
2026-11-14 07:30,Campuses Gate 1 (Kolar Road),185,240,225,56,17,70,Idle parent vans & buses
2026-11-14 07:30,Sports Ground Arena,145,190,190,38,17,71,Open turf morning dew
2026-11-14 07:30,Academic Wing B,90,130,140,24,18,68,Indoor filtration active
2026-11-14 11:00,Campuses Gate 1 (Kolar Road),120,160,165,34,24,52,Gate empty
2026-11-14 11:00,Sports Ground Arena,210,290,260,44,25,50,PT Class sports hour (Unhealthy)
2026-11-14 11:00,Academic Wing B,80,115,125,20,25,48,Indoor stable
2026-11-14 14:30,Campuses Gate 1 (Kolar Road),220,310,270,64,27,45,Major dispersal rush & diesel fumes
2026-11-14 14:30,Sports Ground Arena,160,220,205,42,28,44,After-school athletics
2026-11-14 14:30,Academic Wing B,95,135,145,25,27,45,Filtered
`,
  },
];

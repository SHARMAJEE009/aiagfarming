import type { DashboardStats, Field, Season, Animal, Mob, HealthEvent, FinancialEntry, WeatherData } from "@/types";

export const mockDashboardStats: DashboardStats = {
  totalFields: 12,
  activeSeasons: 8,
  totalAnimals: 1847,
  activeMobs: 14,
  monthlyRevenue: 84500,
  monthlyExpenses: 31200,
  overdueCompliance: 3,
  pendingTasks: 7,
};

export const mockFields: Field[] = [
  { id: "f1", name: "North Paddock A", area: 48.5, soilType: "Clay Loam", organizationId: "org1", createdAt: "2024-01-01" },
  { id: "f2", name: "South Block", area: 62.3, soilType: "Sandy Loam", organizationId: "org1", createdAt: "2024-01-01" },
  { id: "f3", name: "Eastern Creek Field", area: 31.8, soilType: "Loam", organizationId: "org1", createdAt: "2024-01-01" },
  { id: "f4", name: "Western Ridge", area: 55.1, soilType: "Red Clay", organizationId: "org1", createdAt: "2024-01-01" },
  { id: "f5", name: "Home Block", area: 22.4, soilType: "Black Soil", organizationId: "org1", createdAt: "2024-01-01" },
];

export const mockSeasons: Season[] = [
  { id: "s1", fieldId: "f1", cropType: "Wheat", plantedAt: "2024-06-15", status: "active" },
  { id: "s2", fieldId: "f2", cropType: "Canola", plantedAt: "2024-05-20", status: "active" },
  { id: "s3", fieldId: "f3", cropType: "Barley", plantedAt: "2024-07-01", status: "planning" },
  { id: "s4", fieldId: "f4", cropType: "Sorghum", plantedAt: "2024-03-10", harvestedAt: "2024-08-20", yieldKg: 185000, status: "harvested" },
];

export const mockAnimals: Animal[] = [
  { id: "a1", nlisTag: "QKAF1234567", species: "cattle", breed: "Angus", sex: "female", dob: "2022-03-15", mobId: "m1", organizationId: "org1", status: "active" },
  { id: "a2", nlisTag: "QKAF1234568", species: "cattle", breed: "Angus", sex: "male", dob: "2022-04-02", mobId: "m1", organizationId: "org1", status: "active" },
  { id: "a3", nlisTag: "QKAF1234569", species: "cattle", breed: "Hereford", sex: "female", dob: "2021-08-12", mobId: "m2", organizationId: "org1", status: "active" },
];

export const mockMobs: Mob[] = [
  { id: "m1", name: "Breeding Cows #1", species: "cattle", headcount: 285, paddockId: "p1", organizationId: "org1" },
  { id: "m2", name: "Steers 18mo", species: "cattle", headcount: 142, paddockId: "p2", organizationId: "org1" },
  { id: "m3", name: "Ewes Main", species: "sheep", headcount: 680, paddockId: "p3", organizationId: "org1" },
  { id: "m4", name: "Lambs 2024", species: "sheep", headcount: 420, paddockId: "p4", organizationId: "org1" },
  { id: "m5", name: "Weaners", species: "cattle", headcount: 198, paddockId: "p5", organizationId: "org1" },
];

export const mockHealthEvents: HealthEvent[] = [
  { id: "h1", mobId: "m1", eventType: "vaccination", product: "Bovilis MH+PI3", dose: 2, doseUnit: "mL", treatmentDate: "2025-04-15", notes: "Annual 5-in-1" },
  { id: "h2", animalId: "a1", eventType: "treatment", product: "Dectomax Pour-On", dose: 10, doseUnit: "mL", treatmentDate: "2025-05-01", withholdDate: "2025-07-01" },
  { id: "h3", mobId: "m3", eventType: "vaccination", product: "Glanvac 6S", dose: 1, doseUnit: "mL", treatmentDate: "2025-04-20" },
];

export const mockFinancialEntries: FinancialEntry[] = [
  { id: "fin1", category: "Livestock Sales", type: "income", amount: 48000, date: "2025-04-10", description: "Steer sale — Roma Saleyards", organizationId: "org1" },
  { id: "fin2", category: "Grain Sales", type: "income", amount: 36500, date: "2025-04-25", description: "Wheat delivery — GrainCorp Toowoomba", organizationId: "org1" },
  { id: "fin3", category: "Fertiliser", type: "expense", amount: 18200, date: "2025-04-05", description: "Urea 500kg bags x 20", organizationId: "org1" },
  { id: "fin4", category: "Veterinary", type: "expense", amount: 3400, date: "2025-04-18", description: "Preg testing — 285 cows", organizationId: "org1" },
  { id: "fin5", category: "Fuel & Machinery", type: "expense", amount: 9600, date: "2025-04-30", description: "Diesel + spray rig hire", organizationId: "org1" },
];

export const mockWeatherData: WeatherData = {
  location: "Dalby, QLD",
  current: {
    temp: 22,
    feelsLike: 20,
    humidity: 55,
    windSpeed: 18,
    description: "Partly Cloudy",
    icon: "cloud-sun",
  },
  forecast: [
    { date: "2025-05-13", high: 24, low: 14, rain: 0, description: "Sunny", sprayWindow: true },
    { date: "2025-05-14", high: 26, low: 16, rain: 2, description: "Partly Cloudy", sprayWindow: true },
    { date: "2025-05-15", high: 19, low: 12, rain: 18, description: "Showers", sprayWindow: false },
    { date: "2025-05-16", high: 17, low: 10, rain: 28, description: "Rain", sprayWindow: false },
    { date: "2025-05-17", high: 20, low: 11, rain: 5, description: "Mostly Cloudy", sprayWindow: false },
    { date: "2025-05-18", high: 23, low: 13, rain: 0, description: "Sunny", sprayWindow: true },
    { date: "2025-05-19", high: 25, low: 15, rain: 0, description: "Clear", sprayWindow: true },
  ],
};

export const revenueChartData = [
  { month: "Oct", revenue: 52000, expenses: 28000 },
  { month: "Nov", revenue: 68000, expenses: 31000 },
  { month: "Dec", revenue: 45000, expenses: 22000 },
  { month: "Jan", revenue: 71000, expenses: 35000 },
  { month: "Feb", revenue: 63000, expenses: 29000 },
  { month: "Mar", revenue: 89000, expenses: 41000 },
  { month: "Apr", revenue: 84500, expenses: 31200 },
];

export const livestockBySpecies = [
  { species: "Cattle", count: 625 },
  { species: "Sheep", count: 1100 },
  { species: "Goats", count: 122 },
];

// Core types for AIAG Farming

export type UserRole = "OWNER" | "MANAGER" | "AGRONOMIST" | "FARMHAND" | "READ_ONLY";

export type SubscriptionPlan = "starter" | "professional" | "enterprise" | "agronomist";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  trialEndsAt?: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  createdAt: string;
}

// Crop Module
export interface Field {
  id: string;
  name: string;
  area: number; // hectares
  soilType?: string;
  boundary?: GeoJSON;
  organizationId: string;
  createdAt: string;
}

export interface Season {
  id: string;
  fieldId: string;
  cropType: string;
  plantedAt: string;
  harvestedAt?: string;
  yieldKg?: number;
  status: "planning" | "active" | "harvested";
}

export interface SprayRecord {
  id: string;
  fieldId: string;
  product: string;
  rate: number;
  unit: string;
  appliedAt: string;
  withholdDays: number;
  operatorId: string;
  notes?: string;
}

// Livestock Module
export type AnimalSpecies = "cattle" | "sheep" | "pig" | "goat" | "poultry";

export interface Animal {
  id: string;
  nlisTag?: string;
  rfidTag?: string;
  visualTag?: string;
  species: AnimalSpecies;
  breed?: string;
  sex: "male" | "female";
  dob?: string;
  mobId?: string;
  organizationId: string;
  status: "active" | "sold" | "deceased";
}

export interface Mob {
  id: string;
  name: string;
  species: AnimalSpecies;
  headcount: number;
  paddockId?: string;
  organizationId: string;
}

export interface Paddock {
  id: string;
  name: string;
  area: number;
  boundary?: GeoJSON;
  organizationId: string;
}

export interface HealthEvent {
  id: string;
  animalId?: string;
  mobId?: string;
  eventType: "treatment" | "vaccination" | "vet_visit" | "observation";
  product?: string;
  dose?: number;
  doseUnit?: string;
  treatmentDate: string;
  withholdDate?: string;
  vetId?: string;
  notes?: string;
}

export interface WeightRecord {
  id: string;
  animalId: string;
  weightKg: number;
  recordedAt: string;
  method: "crush_scale" | "walk_over" | "estimated";
}

export interface BreedingEvent {
  id: string;
  damId: string;
  sireId?: string;
  joiningDate: string;
  pgTestDate?: string;
  birthDate?: string;
  offspringCount?: number;
  status: "joined" | "confirmed" | "born";
}

export interface LivestockTrade {
  id: string;
  type: "buy" | "sell";
  animalIds: string[];
  headcount: number;
  pricePerHead: number;
  totalPrice: number;
  vendor?: string;
  saleDate: string;
  nlisTransferId?: string;
}

// Finance Module
export interface FinancialEntry {
  id: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  linkedEntityId?: string;
  linkedEntityType?: string;
  date: string;
  description?: string;
  organizationId: string;
}

// Dashboard Types
export interface DashboardStats {
  totalFields: number;
  activeSeasons: number;
  totalAnimals: number;
  activeMobs: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  overdueCompliance: number;
  pendingTasks: number;
}

// GeoJSON
export type GeoJSON = {
  type: "Polygon" | "MultiPolygon" | "Point";
  coordinates: number[][][] | number[][];
};

// Weather
export interface WeatherData {
  location: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: WeatherDay[];
}

export interface WeatherDay {
  date: string;
  high: number;
  low: number;
  rain: number;
  description: string;
  sprayWindow: boolean;
}

// AI Advisor
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

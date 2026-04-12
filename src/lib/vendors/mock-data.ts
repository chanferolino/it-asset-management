import type { Vendor } from "./types";

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v_001",
    name: "Acme Supply Co.",
    contactEmail: "sales@acmesupply.example",
    contactPhone: "+1 (415) 555-0142",
    website: "https://acmesupply.example",
    notes: "Primary laptop and desktop supplier. Net-30 terms.",
    createdAt: "2025-08-14T09:00:00.000Z",
  },
  {
    id: "v_002",
    name: "MetroTech Partners",
    contactEmail: "accounts@metrotech.example",
    contactPhone: "415.555.0188",
    website: "https://metrotech.example",
    createdAt: "2025-09-02T14:30:00.000Z",
  },
  {
    id: "v_003",
    name: "BrightPixel Displays",
    contactEmail: "hello@brightpixel.example",
    website: "https://brightpixel.example",
    notes: "Specialty monitors and calibration services.",
    createdAt: "2025-10-19T11:15:00.000Z",
  },
  {
    id: "v_004",
    name: "Northwind Mobile",
    contactEmail: "support@northwindmobile.example",
    contactPhone: "+1-212-555-0109",
    createdAt: "2025-11-05T08:45:00.000Z",
  },
  {
    id: "v_005",
    name: "Quill & Cable",
    contactEmail: "orders@quillandcable.example",
    contactPhone: "(646) 555-0174",
    website: "https://quillandcable.example",
    notes: "Accessories, cables, and small peripherals.",
    createdAt: "2025-12-12T16:20:00.000Z",
  },
  {
    id: "v_006",
    name: "Summit Hardware",
    contactEmail: "billing@summithardware.example",
    website: "https://summithardware.example",
    createdAt: "2026-01-22T10:05:00.000Z",
  },
];

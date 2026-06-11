export type UserRole = "Admin" | "Manager" | "Sales" | "Housekeeping" | "Accounts" | "Reception" | "Tenant" | "Guest";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  documentUrl?: string; // ID proof
  aadharUrl?: string;
  panUrl?: string;
  emergencyContact?: string;
}

export type PropertyType = "Coliving" | "PG" | "Airbnb" | "Apartment";
export type GenderPreference = "Male" | "Female" | "Unisex";

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  isCover: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string; // lucide icon name
  category: "Basic" | "Comfort" | "Entertainment" | "Security";
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  type: "Single" | "Double Sharing" | "Triple Sharing";
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  electricityCharges: string; // e.g., "Metered" or "Fixed"
  waterCharges: number;
  totalBeds: number;
  availableBeds: number;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  gender: GenderPreference;
  address: string;
  city: string;
  rating: number;
  description: string;
  virtualTourUrl?: string;
  videoUrl?: string;
  googleMapEmbedUrl?: string;
  images: PropertyImage[];
  rooms: Room[];
  amenities: string[]; // List of amenity IDs
  nearby: {
    metro: string[];
    techParks: string[];
    food: string[];
    hospitals: string[];
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  roomId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  roomType: string;
  moveInDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "CheckedIn" | "CheckedOut";
  digitalContractSigned: boolean;
  contractUrl?: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  paidAmount?: number;
  dueAtCheckIn?: number;
  isTokenBooking?: boolean;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  bookingId?: string;
  amount: number;
  type: "Rent" | "Deposit" | "Maintenance" | "Refund" | "Penalty";
  method: "Razorpay" | "UPI" | "Credit Card" | "Debit Card" | "Cash";
  status: "Success" | "Pending" | "Failed";
  date: string;
  invoiceId: string;
  billingPeriod?: string; // e.g. "June 2026"
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  bookingId?: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  billPeriod: string;
  generatedDate: string;
}

export type ComplaintCategory = "Electrical" | "Plumbing" | "Cleaning" | "Internet" | "Furniture" | "Security" | "Other";
export type ComplaintStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export interface Complaint {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  dateRaised: string;
  assignedTo?: string; // Employee ID or name
  comments: ComplaintComment[];
}

export interface ComplaintComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export type LeadSource = "Website" | "WhatsApp" | "Phone Call" | "Google Ads" | "Facebook Ads" | "Instagram";
export type LeadStatus = "New Lead" | "Contacted" | "Visit Scheduled" | "Visit Completed" | "Negotiation" | "Booked" | "Lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string; // Admin or sales staff name
  notes: string;
  followUpDate: string;
  createdAt: string;
  propertyInterestId?: string;
  propertyNameInterest?: string;
}

export interface HousekeepingTask {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: "Pending" | "InProgress" | "Completed";
  photoBefore?: string;
  photoAfter?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  category: "Maintenance" | "Utility" | "Salary" | "Marketing" | "Taxes" | "Other";
  description: string;
  date: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientPhoneOrEmail: string;
  channel: "WhatsApp" | "Email" | "SMS";
  type: "Lead Welcome" | "Visit Confirm" | "Rent Reminder" | "Complaint Update" | "Move-In Notice";
  content: string;
  timestamp: string;
  status: "Sent" | "Failed";
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  bookingId: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar?: string;
  ratingCleanliness: number;  // 1-5 star
  ratingLocation: number;     // 1-5 star
  ratingAmenities: number;    // 1-5 star
  ratingValue: number;        // 1-5 star
  ratingStaff: number;        // 1-5 star
  averageRating: number;      // average of above
  comment: string;
  createdAt: string;
}

export interface ReferralCode {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  code: string;
  rewardEarned: number;
}

export interface ReferralConversion {
  id: string;
  codeId: string;
  referrerUserId: string;
  referrerName: string;
  referrerEmail: string;
  referrerCode: string;
  referredEmail: string;
  referredName: string;
  bookingId?: string;
  propertyName?: string;
  status: "Pending" | "Completed"; // Completed when booking is successfully confirmed/paid
  referrerReward: number; // e.g. 2000
  referredDiscount: number; // e.g. 1500
  convertedAt: string;
}


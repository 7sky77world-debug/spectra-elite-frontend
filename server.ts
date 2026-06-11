import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { AMENITIES, INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_COMPLAINTS, INITIAL_HOUSEKEEPING, INITIAL_EXPENSES, INITIAL_NOTIFICATIONS, PRESET_USERS } from "./src/data/mockData";
import { Property, Lead, Booking, Payment, Invoice, Complaint, HousekeepingTask, Expense, NotificationLog, User, PropertyReview, ReferralCode, ReferralConversion } from "./src/types";

// Lazy-like persistent data file in workspace
const DATA_FILE = path.join(process.cwd(), "data_store.json");

// Define custom DB class to handle data storage
class Database {
  properties: Property[] = [];
  leads: Lead[] = [];
  bookings: Booking[] = [];
  payments: Payment[] = [];
  invoices: Invoice[] = [];
  complaints: Complaint[] = [];
  housekeeping: HousekeepingTask[] = [];
  expenses: Expense[] = [];
  notifications: NotificationLog[] = [];
  users: User[] = [];
  reviews: PropertyReview[] = [];
  referralCodes: ReferralCode[] = [];
  referralConversions: ReferralConversion[] = [];

  constructor() {
    this.load();
  }

  load() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        this.properties = data.properties || INITIAL_PROPERTIES;
        this.leads = data.leads || INITIAL_LEADS;
        this.bookings = data.bookings || INITIAL_BOOKINGS;
        this.payments = data.payments || INITIAL_PAYMENTS;
        this.invoices = data.invoices || INITIAL_INVOICES;
        this.complaints = data.complaints || INITIAL_COMPLAINTS;
        this.housekeeping = data.housekeeping || INITIAL_HOUSEKEEPING;
        this.expenses = data.expenses || INITIAL_EXPENSES;
        this.notifications = data.notifications || INITIAL_NOTIFICATIONS;
        this.users = data.users || PRESET_USERS;
        this.reviews = data.reviews || this.getInitialReviews();
        this.referralCodes = data.referralCodes || this.getInitialReferralCodes();
        this.referralConversions = data.referralConversions || this.getInitialReferralConversions();
        console.log("Database initialized from storage file.");
      } catch (err) {
        console.error("Error decoding data_store.json, resetting to default.", err);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  getInitialReviews(): PropertyReview[] {
    return [
      {
        id: "rev-1",
        propertyId: "prop-1",
        bookingId: "bk-sample-1",
        tenantId: "usr-sample-tenant-1",
        tenantName: "Siddharth Malhotra",
        tenantAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Siddharth",
        ratingCleanliness: 5,
        ratingLocation: 5,
        ratingAmenities: 4,
        ratingValue: 5,
        ratingStaff: 5,
        averageRating: 4.8,
        comment: "Spectra Elite #38 has redefined coliving in Bhoganhalli! The rooms are super clean and Ramu from housekeeping gets it turned over perfectly every afternoon. The internet speed is blazing fast (over 250mbps), which is perfect for my WFH setup. Truly luxury living at a smart price point.",
        createdAt: "2026-05-15T10:00:00Z"
      },
      {
        id: "rev-2",
        propertyId: "prop-1",
        bookingId: "bk-1",
        tenantId: "usr-tenant-1",
        tenantName: "Rahul Verma",
        tenantAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        ratingCleanliness: 5,
        ratingLocation: 5,
        ratingAmenities: 5,
        ratingValue: 4,
        ratingStaff: 5,
        averageRating: 4.8,
        comment: "Outstanding experience so far! The tech integrations like digital lock keys, Whatsapp automated ledger notifications, and the helpfulness of the support staff are superb. Located in a beautiful part of Bhoganhalli with plenty of cafes around.",
        createdAt: "2026-06-08T15:30:00Z"
      }
    ];
  }

  getInitialReferralCodes(): ReferralCode[] {
    return [
      {
        id: "rc-1",
        userId: "usr-tenant-1",
        userEmail: "verma.rahul@gmail.com",
        userName: "Rahul Verma",
        code: "RAHUL38E",
        rewardEarned: 2000
      },
      {
        id: "rc-2",
        userId: "usr-admin",
        userEmail: "7sky77world@gmail.com",
        userName: "Aditya Hegde",
        code: "ADITYAELITE",
        rewardEarned: 0
      }
    ];
  }

  getInitialReferralConversions(): ReferralConversion[] {
    return [
      {
        id: "rconv-1",
        codeId: "rc-1",
        referrerUserId: "usr-tenant-1",
        referrerName: "Rahul Verma",
        referrerEmail: "verma.rahul@gmail.com",
        referrerCode: "RAHUL38E",
        referredEmail: "kunal.grover@gmail.com",
        referredName: "Kunal Grover",
        bookingId: "bk-sample-legacy",
        propertyName: "Spectra Elite #38 Luxury Coliving",
        status: "Completed",
        referrerReward: 2000,
        referredDiscount: 1500,
        convertedAt: "2026-05-20T11:45:00Z"
      },
      {
        id: "rconv-2",
        codeId: "rc-1",
        referrerUserId: "usr-tenant-1",
        referrerName: "Rahul Verma",
        referrerEmail: "verma.rahul@gmail.com",
        referrerCode: "RAHUL38E",
        referredEmail: "priyanka.s@gmail.com",
        referredName: "Priyanka Sharma",
        bookingId: "bk-sample-pending",
        propertyName: "Spectra Elite #38 Luxury Coliving",
        status: "Pending",
        referrerReward: 2000,
        referredDiscount: 1500,
        convertedAt: "2026-06-09T09:10:00Z"
      }
    ];
  }

  resetToDefaults() {
    this.properties = [...INITIAL_PROPERTIES];
    this.leads = [...INITIAL_LEADS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.payments = [...INITIAL_PAYMENTS];
    this.invoices = [...INITIAL_INVOICES];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.housekeeping = [...INITIAL_HOUSEKEEPING];
    this.expenses = [...INITIAL_EXPENSES];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.users = [...PRESET_USERS];
    this.reviews = this.getInitialReviews();
    this.referralCodes = this.getInitialReferralCodes();
    this.referralConversions = this.getInitialReferralConversions();
    this.save();
    console.log("Database initialized with seed data.");
  }

  save() {
    try {
      const dirOfFile = path.dirname(DATA_FILE);
      if (!fs.existsSync(dirOfFile)) {
        fs.mkdirSync(dirOfFile, { recursive: true });
      }
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
          {
            properties: this.properties,
            leads: this.leads,
            bookings: this.bookings,
            payments: this.payments,
            invoices: this.invoices,
            complaints: this.complaints,
            housekeeping: this.housekeeping,
            expenses: this.expenses,
            notifications: this.notifications,
            users: this.users,
            reviews: this.reviews,
            referralCodes: this.referralCodes,
            referralConversions: this.referralConversions
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (e) {
      console.error("Failed to persist database file", e);
    }
  }
}

const db = new Database();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints -----------------------------------------------------------

  // Properties APIS
  app.get("/api/properties", (req, res) => {
    res.json(db.properties);
  });

  app.post("/api/properties", (req, res) => {
    const newProperty: Property = {
      id: "prop-" + Date.now(),
      ...req.body,
    };
    db.properties.push(newProperty);
    db.save();
    res.status(201).json(newProperty);
  });

  app.put("/api/properties/:id", (req, res) => {
    const { id } = req.params;
    const index = db.properties.findIndex((p) => p.id === id);
    if (index !== -1) {
      db.properties[index] = { ...db.properties[index], ...req.body };
      db.save();
      res.json(db.properties[index]);
    } else {
      res.status(404).json({ error: "Property not found" });
    }
  });

  app.delete("/api/properties/:id", (req, res) => {
    const { id } = req.params;
    db.properties = db.properties.filter((p) => p.id !== id);
    db.save();
    res.json({ success: true });
  });

  // Leads APIs (CRM)
  app.get("/api/leads", (req, res) => {
    res.json(db.leads);
  });

  app.post("/api/leads", (req, res) => {
    const newLead: Lead = {
      id: "lead-" + Date.now(),
      createdAt: new Date().toISOString(),
      followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // default 2 days followUp
      ...req.body,
    };
    db.leads.unshift(newLead);

    // Meta WhatsApp simulation trigger
    const welcomeLog: NotificationLog = {
      id: "not-" + Date.now(),
      recipientName: newLead.name,
      recipientPhoneOrEmail: newLead.phone || newLead.email,
      channel: "WhatsApp",
      type: "Lead Welcome",
      content: `Hi ${newLead.name}, thank you for reaching out to Spectra Elite #38! We have captured your request regarding our premium rooms. A Relationship Manager will be in touch with you shortly.`,
      timestamp: new Date().toISOString(),
      status: "Sent",
    };
    db.notifications.unshift(welcomeLog);

    db.save();
    res.status(201).json(newLead);
  });

  app.put("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    const index = db.leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      const oldStatus = db.leads[index].status;
      db.leads[index] = { ...db.leads[index], ...req.body };
      
      // WhatsApp Auto-Trigger on Lead Pipeline changes (e.g., Scheduled Visit)
      if (req.body.status && req.body.status !== oldStatus) {
        let content = "";
        let type: any = "Visit Confirm";
        if (req.body.status === "Visit Scheduled") {
          content = `Hi ${db.leads[index].name}, your physical visit at Spectra Elite has been scheduled for ${db.leads[index].followUpDate}. Location Link: HSR Layout, Sec 4. See you there!`;
        } else if (req.body.status === "Booked") {
          content = `Congratulations ${db.leads[index].name}! Your booking at Spectra Elite has been confirmed. Welcome home!`;
          type = "Visit Confirm"; // generic category
        }
        
        if (content) {
          db.notifications.unshift({
            id: "not-" + Date.now(),
            recipientName: db.leads[index].name,
            recipientPhoneOrEmail: db.leads[index].phone,
            channel: "WhatsApp",
            type: type,
            content: content,
            timestamp: new Date().toISOString(),
            status: "Sent",
          });
        }
      }

      db.save();
      res.json(db.leads[index]);
    } else {
      res.status(404).json({ error: "Lead not found" });
    }
  });

  // Bookings APIS
  app.get("/api/bookings", (req, res) => {
    res.json(db.bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const bookingId = "bk-" + Date.now();
    const newBooking: Booking = {
      id: bookingId,
      status: "Pending",
      digitalContractSigned: false,
      paymentStatus: "Pending",
      ...req.body,
    };
    db.bookings.push(newBooking);

    // Auto generate move-in rental invoices (Rent + Security Deposit)
    const depositInvoice: Invoice = {
      id: "inv-" + Date.now() + "-dep",
      tenantId: newBooking.tenantId,
      tenantName: newBooking.tenantName,
      bookingId: bookingId,
      amount: newBooking.securityDeposit,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      status: "Unpaid",
      billPeriod: "Move-In Security Deposit",
      generatedDate: new Date().toISOString().split("T")[0],
    };
    db.invoices.push(depositInvoice);

    // WhatsApp Log
    db.notifications.unshift({
      id: "not-" + Date.now(),
      recipientName: newBooking.tenantName,
      recipientPhoneOrEmail: "+91 91112 33344", // sample
      channel: "WhatsApp",
      type: "Visit Confirm",
      content: `Hello ${newBooking.tenantName}, your security deposit invoice of Rs ${newBooking.securityDeposit} has been generated for room ${newBooking.roomNumber}. Use guest dashboard to pay.`,
      timestamp: new Date().toISOString(),
      status: "Sent",
    });

    db.save();
    res.status(201).json(newBooking);
  });

  app.put("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const index = db.bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      db.bookings[index] = { ...db.bookings[index], ...req.body };
      db.save();
      res.json(db.bookings[index]);
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  });

  // Payments / Rent APIS
  app.get("/api/payments", (req, res) => {
    res.json(db.payments);
  });

  app.post("/api/payments", (req, res) => {
    const payment: Payment = {
      id: "pay-" + Date.now(),
      date: new Date().toISOString(),
      status: "Success",
      ...req.body,
    };
    db.payments.unshift(payment);

    // Mark corresponding invoices as Paid
    if (payment.invoiceId) {
      const idx = db.invoices.findIndex((inv) => inv.id === payment.invoiceId);
      if (idx !== -1) {
        db.invoices[idx].status = "Paid";
      }
    }

    // Mark booking payment status as Paid if deposit paid
    if (payment.bookingId && payment.type === "Deposit") {
      const bIdx = db.bookings.findIndex((b) => b.id === payment.bookingId);
      if (bIdx !== -1) {
        db.bookings[bIdx].paymentStatus = "Paid";
        db.bookings[bIdx].status = "Confirmed";
      }
    }

    db.save();
    res.status(201).json(payment);
  });

  // Invoices
  app.get("/api/invoices", (req, res) => {
    res.json(db.invoices);
  });

  app.post("/api/invoices", (req, res) => {
    const newInvoice = {
      id: "inv-" + Date.now(),
      ...req.body
    };
    db.invoices.unshift(newInvoice);
    db.save();
    res.status(201).json(newInvoice);
  });

  app.post("/api/invoices/generate-monthly", (req, res) => {
    // Generate monthly rent invoices for checked-in tenants
    const checkedIn = db.bookings.filter((b) => b.status === "CheckedIn");
    const newInvs: Invoice[] = [];
    checkedIn.forEach((b) => {
      const invId = "inv-" + Date.now() + "-" + b.id.slice(-4);
      const inv: Invoice = {
        id: invId,
        tenantId: b.tenantId,
        tenantName: b.tenantName,
        bookingId: b.id,
        amount: b.monthlyRent + 1200, // rent + maintenance
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
        status: "Unpaid",
        billPeriod: `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()} Rent + Maintenance`,
        generatedDate: new Date().toISOString().split("T")[0],
      };
      db.invoices.unshift(inv);
      newInvs.push(inv);

      // Trigger automatic Rent Notification reminder
      db.notifications.unshift({
        id: "not-" + Date.now() + "-" + b.id.slice(-4),
        recipientName: b.tenantName,
        recipientPhoneOrEmail: "+91 91112 33344",
        channel: "WhatsApp",
        type: "Rent Reminder",
        content: `Hi ${b.tenantName}, your Rent Invoice ${invId} of Rs ${inv.amount} for the current month is due on ${inv.dueDate}. Please pay timely to avoid dynamic late charges!`,
        timestamp: new Date().toISOString(),
        status: "Sent",
      });
    });

    db.save();
    res.json({ message: `Successfully generated ${newInvs.length} invoices.`, invoices: newInvs });
  });

  // Complaints APIs
  app.get("/api/complaints", (req, res) => {
    res.json(db.complaints);
  });

  app.post("/api/complaints", (req, res) => {
    const newComp: Complaint = {
      id: "comp-" + Date.now(),
      dateRaised: new Date().toISOString(),
      status: "Open",
      comments: [],
      ...req.body,
    };
    db.complaints.unshift(newComp);
    db.save();
    res.status(201).json(newComp);
  });

  app.put("/api/complaints/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const idx = db.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.complaints[idx].status = status;
      if (assignedTo) db.complaints[idx].assignedTo = assignedTo;

      // WhatsApp update simulation
      db.notifications.unshift({
        id: "not-" + Date.now(),
        recipientName: db.complaints[idx].tenantName,
        recipientPhoneOrEmail: "+91 91112 33344",
        channel: "WhatsApp",
        type: "Complaint Update",
        content: `Updates on Complaint #${id}: Your issue regarding '${db.complaints[idx].title}' has been moved to status '${status}'${assignedTo ? ` and assigned to ${assignedTo}` : ""}.`,
        timestamp: new Date().toISOString(),
        status: "Sent",
      });

      db.save();
      res.json(db.complaints[idx]);
    } else {
      res.status(404).json({ error: "Complaint not found" });
    }
  });

  app.post("/api/complaints/:id/comments", (req, res) => {
    const { id } = req.params;
    const comment = {
      id: "cc-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    const idx = db.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.complaints[idx].comments.push(comment);
      db.save();
      res.json(db.complaints[idx]);
    } else {
      res.status(404).json({ error: "Complaint not found" });
    }
  });

  // Housekeeping APIs
  app.get("/api/housekeeping", (req, res) => {
    res.json(db.housekeeping);
  });

  app.post("/api/housekeeping", (req, res) => {
    const newTask: HousekeepingTask = {
      id: "task-" + Date.now(),
      status: "Pending",
      ...req.body,
    };
    db.housekeeping.unshift(newTask);
    db.save();
    res.status(201).json(newTask);
  });

  app.put("/api/housekeeping/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.housekeeping.findIndex((t) => t.id === id);
    if (idx !== -1) {
      db.housekeeping[idx] = { ...db.housekeeping[idx], ...req.body };
      db.save();
      res.json(db.housekeeping[idx]);
    } else {
      res.status(404).json({ error: "Housekeeping task not found" });
    }
  });

  // Expenses APIs
  app.get("/api/expenses", (req, res) => {
    res.json(db.expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const newExpense: Expense = {
      id: "exp-" + Date.now(),
      ...req.body,
    };
    db.expenses.unshift(newExpense);
    db.save();
    res.status(201).json(newExpense);
  });

  // Notifications Log APIs
  app.get("/api/notifications", (req, res) => {
    res.json(db.notifications);
  });

  // --- PROPERTY RATING & REVIEW APIS ---
  app.get("/api/reviews", (req, res) => {
    res.json(db.reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { propertyId, ratingCleanliness, ratingLocation, ratingAmenities, ratingValue, ratingStaff, comment, tenantId, tenantName, bookingId } = req.body;
    
    // Calculate average for this review
    const clean = Number(ratingCleanliness) || 5;
    const loc = Number(ratingLocation) || 5;
    const amen = Number(ratingAmenities) || 5;
    const val = Number(ratingValue) || 5;
    const staff = Number(ratingStaff) || 5;
    const averageRating = parseFloat(((clean + loc + amen + val + staff) / 5).toFixed(1));

    const newReview: PropertyReview = {
      id: "rev-" + Date.now(),
      propertyId,
      bookingId: bookingId || "",
      tenantId: tenantId || "usr-anon",
      tenantName: tenantName || "Anonymous Resident",
      tenantAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${tenantName || "Anon"}`,
      ratingCleanliness: clean,
      ratingLocation: loc,
      ratingAmenities: amen,
      ratingValue: val,
      ratingStaff: staff,
      averageRating,
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);

    // Recalculate average rating of this property
    const propReviews = db.reviews.filter((r) => r.propertyId === propertyId);
    if (propReviews.length > 0) {
      const sum = propReviews.reduce((acc, r) => acc + r.averageRating, 0);
      const newPropertyRating = parseFloat((sum / propReviews.length).toFixed(1));
      
      const propIndex = db.properties.findIndex((p) => p.id === propertyId);
      if (propIndex !== -1) {
        db.properties[propIndex].rating = newPropertyRating;
      }
    }

    db.save();
    res.status(201).json(newReview);
  });

  // --- REFERRAL PROGRAM APIS ---
  app.get("/api/referrals/codes", (req, res) => {
    res.json(db.referralCodes);
  });

  app.get("/api/referrals/conversions", (req, res) => {
    res.json(db.referralConversions);
  });

  // Get or auto-generate a custom referral code for a user
  app.get("/api/referrals/code/:userEmail", (req, res) => {
    const { userEmail } = req.params;
    const decodedEmail = decodeURIComponent(userEmail).toLowerCase();
    
    let referral = db.referralCodes.find((rc) => rc.userEmail.toLowerCase() === decodedEmail);
    if (!referral) {
      // Find the user details to make a custom referral code
      const u = db.users.find((user) => user.email.toLowerCase() === decodedEmail);
      const name = u ? u.name : "Resident";
      const cleanedName = name.replace(/\s+/g, "").toUpperCase().slice(0, 5);
      const generatedCode = `${cleanedName}${Math.floor(100 + Math.random() * 900)}`;
      
      referral = {
        id: "rc-" + Date.now(),
        userId: u ? u.id : ("usr-" + Date.now()),
        userEmail: decodedEmail,
        userName: name,
        code: generatedCode,
        rewardEarned: 0
      };
      db.referralCodes.push(referral);
      db.save();
    }
    res.json(referral);
  });

  // Verify a referral code to see if it exists and apply a discount
  app.post("/api/referrals/verify", (req, res) => {
    const { code, email } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: "Referral code is required" });
    }
    
    const referral = db.referralCodes.find((rc) => rc.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!referral) {
      return res.status(404).json({ valid: false, error: "The referral code is invalid." });
    }

    if (email && referral.userEmail.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ valid: false, error: "You cannot refer yourself!" });
    }

    res.json({
      valid: true,
      code: referral.code,
      referrerName: referral.userName,
      discountText: "10% Rent & Security Deposit Discount Applied",
      referredDiscount: 1500, // discount amount in ₹
      referrerReward: 2000
    });
  });

  // Track / apply a conversion upon a successful booking session
  app.post("/api/referrals/apply-conversion", (req, res) => {
    const { code, referredEmail, referredName, bookingId, propertyName } = req.body;
    
    const referral = db.referralCodes.find((rc) => rc.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!referral) {
      return res.status(404).json({ error: "Referral code not found" });
    }

    const conversion: ReferralConversion = {
      id: "rconv-" + Date.now(),
      codeId: referral.id,
      referrerUserId: referral.userId,
      referrerName: referral.userName,
      referrerEmail: referral.userEmail,
      referrerCode: referral.code,
      referredEmail: referredEmail,
      referredName: referredName,
      bookingId: bookingId || "",
      propertyName: propertyName || "Spectra Elite #38 Location Room",
      status: "Completed", // instantly completed because booking is processed
      referrerReward: 2000,
      referredDiscount: 1500,
      convertedAt: new Date().toISOString()
    };

    // Update referrer's reward earned
    referral.rewardEarned += 2000;

    db.referralConversions.unshift(conversion);

    // Create custom notification WhatsApp log about referral reward!
    db.notifications.unshift({
      id: "not-" + Date.now(),
      recipientName: referral.userName,
      recipientPhoneOrEmail: "+91 91112 33344", // dummy mobile
      channel: "WhatsApp",
      type: "Move-In Notice",
      content: `Woohoo ${referral.userName}! Your friend ${referredName} just booked a premium space on Spectra Elite using your code ${referral.code}. You have earned a cash reward of Rs 2,000! Your total referral payout is Rs ${referral.rewardEarned}.`,
      timestamp: new Date().toISOString(),
      status: "Sent"
    });

    db.save();
    res.status(201).json(conversion);
  });

  // Analytics APIs
  app.get("/api/analytics", (req, res) => {
    // Collect stats
    const totalProperties = db.properties.length;
    
    // Beds and Rooms logic
    let totalBeds = 0;
    let vacantBeds = 0;
    db.properties.forEach((p) => {
      p.rooms.forEach((r) => {
        totalBeds += r.totalBeds;
        vacantBeds += r.availableBeds;
      });
    });
    const totalOccupancy = totalBeds - vacantBeds;

    // Monthly revenue from payments
    const monthlyRevenue = db.payments
      .filter((p) => p.status === "Success" && p.type === "Rent")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = db.invoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const complaintsCount = db.complaints.filter((c) => c.status !== "Closed" && c.status !== "Resolved").length;
    const leadsCount = db.leads.length;
    const bookingsCount = db.bookings.length;

    // Categorized expenses
    const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group items for dashboards
    const leadConversion = {
      total: db.leads.length,
      booked: db.leads.filter((l) => l.status === "Booked").length,
      contacted: db.leads.filter((l) => l.status === "Contacted" || l.status === "Visit Scheduled").length,
      lost: db.leads.filter((l) => l.status === "Lost").length,
    };

    res.json({
      totalProperties,
      totalOccupancy,
      totalBeds,
      vacantBeds,
      monthlyRevenue,
      pendingPayments,
      complaintsCount,
      leadsCount,
      bookingsCount,
      totalExpenses,
      leadConversion,
    });
  });

  // System users configuration
  app.get("/api/users", (req, res) => {
    res.json(db.users);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...req.body };
      db.save();
      res.json(db.users[idx]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Spectra Elite #38 API] Server running on port ${PORT}`);
  });
}

startServer();

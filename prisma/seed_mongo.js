const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.join(__dirname, "../.env"), "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/);
  if (match) envVars[match[1]] = match[2];
});

const uri = (envVars.DATABASE_URL && envVars.DATABASE_URL.startsWith("mongodb"))
  ? envVars.DATABASE_URL
  : "mongodb://127.0.0.1:27017/civictrack?directConnection=true";

const DEPARTMENTS = [
  "Road Maintenance Department",
  "Sanitation Department",
  "Water Supply Department",
  "Electricity Department",
  "Public Works Department",
];

const CATEGORIES = [
  {
    id: "pothole",
    name: "Potholes",
    description: "Road surface damage causing hazards for vehicles and pedestrians",
    icon: "circle-alert",
    department: "Road Maintenance Department",
  },
  {
    id: "garbage",
    name: "Garbage",
    description: "Overflowing bins, illegal dumping, and waste accumulation",
    icon: "trash-2",
    department: "Sanitation Department",
  },
  {
    id: "water-leakage",
    name: "Water Leakage",
    description: "Pipe bursts, water seepage, and drainage issues",
    icon: "droplets",
    department: "Water Supply Department",
  },
  {
    id: "streetlight",
    name: "Streetlight",
    description: "Non-functional or damaged street lights affecting safety",
    icon: "lamp",
    department: "Electricity Department",
  },
  {
    id: "electric-pole",
    name: "Electric Pole",
    description: "Damaged, leaning, or fallen electric poles",
    icon: "zap",
    department: "Electricity Department",
  },
  {
    id: "other",
    name: "Other",
    description: "Any other civic infrastructure issue not listed above",
    icon: "alert-triangle",
    department: "Public Works Department",
  },
];

async function main() {
  console.log("Connecting to MongoDB:", uri);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("Seeding MongoDB departments...");
  const deptColl = db.collection("Department");
  const departmentIdByName = {};
  for (const name of DEPARTMENTS) {
    let dept = await deptColl.findOne({ name });
    if (!dept) {
      const res = await deptColl.insertOne({ name });
      dept = { _id: res.insertedId, id: res.insertedId.toString(), name };
    } else {
      dept.id = dept._id.toString();
    }
    departmentIdByName[name] = dept.id;
  }

  console.log("Seeding MongoDB categories...");
  const catColl = db.collection("Category");
  for (const cat of CATEGORIES) {
    await catColl.updateOne(
      { _id: cat.id },
      {
        $set: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          departmentId: departmentIdByName[cat.department],
        },
      },
      { upsert: true }
    );
  }

  console.log("Seeding MongoDB demo accounts...");
  const userColl = db.collection("User");
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 10);
  let admin = await userColl.findOne({ email: "admin@civictrack.gov.in" });
  if (!admin) {
    const res = await userColl.insertOne({
      name: "Admin User",
      email: "admin@civictrack.gov.in",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    admin = { _id: res.insertedId, id: res.insertedId.toString() };
  } else {
    admin.id = admin._id.toString();
  }

  const citizenPasswordHash = await bcrypt.hash("Citizen@1234", 10);
  let citizen = await userColl.findOne({ email: "rahul@example.com" });
  if (!citizen) {
    const res = await userColl.insertOne({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      passwordHash: citizenPasswordHash,
      role: "CITIZEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    citizen = { _id: res.insertedId, id: res.insertedId.toString() };
  } else {
    citizen.id = citizen._id.toString();
  }

  const compColl = db.collection("Complaint");
  const statusColl = db.collection("StatusUpdate");
  const existingCount = await compColl.countDocuments();

  if (existingCount === 0) {
    console.log("Seeding MongoDB demo complaints...");
    const demoComplaints = [
      {
        categoryId: "pothole",
        description:
          "Large pothole on the main road causing traffic problems and risk of accidents for two-wheelers.",
        location: "Sector 14 Main Road, near City Mall",
        status: "IN_PROGRESS",
        confidenceScore: 94,
      },
      {
        categoryId: "garbage",
        description: "Garbage has been piling up for over a week near the community park entrance.",
        location: "Park Street, Block B",
        status: "RESOLVED",
        confidenceScore: 91,
        resolutionNote: "Sanitation team cleared the area. Additional bin has been placed.",
      },
      {
        categoryId: "water-leakage",
        description: "Major water leakage from underground pipe. Water flooding the road and sidewalk.",
        location: "MG Road, Opposite City Hospital",
        status: "IN_PROGRESS",
        confidenceScore: 88,
      },
      {
        categoryId: "streetlight",
        description: "Streetlight not working for past 3 days. Very dark at night, safety concern.",
        location: "Civil Lines, Street Number 7",
        status: "RESOLVED",
        confidenceScore: 96,
        resolutionNote: "Replaced faulty bulb and repaired wiring.",
      },
      {
        categoryId: "electric-pole",
        description: "Electric pole is leaning heavily after recent storm. Risk of falling.",
        location: "Industrial Area, Phase 2",
        status: "SUBMITTED",
        confidenceScore: 92,
      },
    ];

    for (const c of demoComplaints) {
      const category = await catColl.findOne({ _id: c.categoryId });
      const isResolved = c.status === "RESOLVED";
      const res = await compColl.insertOne({
        referenceCode: `CT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        description: c.description,
        location: c.location,
        status: c.status,
        confidenceScore: c.confidenceScore,
        resolutionNote: c.resolutionNote || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: isResolved ? new Date() : null,
        categoryId: category.id,
        departmentId: category.departmentId,
        reportedById: citizen.id,
      });

      await statusColl.insertOne({
        complaintId: res.insertedId.toString(),
        status: c.status,
        note: c.resolutionNote || null,
        createdAt: new Date(),
      });
    }
  }

  console.log("MongoDB Seed completed successfully!");
  console.log("Admin account:   admin@civictrack.gov.in / Admin@1234");
  console.log("Citizen account: rahul@example.com / Citizen@1234");
  await client.close();
}

main().catch(console.error);

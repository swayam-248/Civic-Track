// Seeds MongoDB database with reference data and demo accounts + complaints
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

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
  console.log("Seeding departments...");
  const departmentIdByName = {};
  for (const name of DEPARTMENTS) {
    let dept = await db.department.findUnique({ where: { name } });
    if (!dept) {
      dept = await db.department.create({ data: { name } });
    }
    departmentIdByName[name] = dept.id;
  }

  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    const existing = await db.category.findUnique({ where: { id: cat.id } });
    if (!existing) {
      await db.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          departmentId: departmentIdByName[cat.department],
        },
      });
    } else {
      await db.category.update({
        where: { id: cat.id },
        data: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          departmentId: departmentIdByName[cat.department],
        },
      });
    }
  }

  console.log("Seeding demo accounts...");
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 10);
  let admin = await db.user.findUnique({ where: { email: "admin@civictrack.gov.in" } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        name: "Admin User",
        email: "admin@civictrack.gov.in",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });
  }

  const citizenPasswordHash = await bcrypt.hash("Citizen@1234", 10);
  let citizen = await db.user.findUnique({ where: { email: "rahul@example.com" } });
  if (!citizen) {
    citizen = await db.user.create({
      data: {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        passwordHash: citizenPasswordHash,
        role: "CITIZEN",
      },
    });
  }

  const existingComplaints = await db.complaint.count();
  if (existingComplaints === 0) {
    console.log("Seeding demo complaints...");
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
      const category = await db.category.findUnique({ where: { id: c.categoryId } });
      const isResolved = c.status === "RESOLVED";
      const complaint = await db.complaint.create({
        data: {
          referenceCode: `CT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          description: c.description,
          location: c.location,
          status: c.status,
          confidenceScore: c.confidenceScore,
          resolutionNote: c.resolutionNote,
          resolvedAt: isResolved ? new Date() : null,
          categoryId: category.id,
          departmentId: category.departmentId,
          reportedById: citizen.id,
        },
      });

      await db.statusUpdate.create({
        data: {
          complaintId: complaint.id,
          status: c.status,
          note: c.resolutionNote || null,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login:   admin@civictrack.gov.in / Admin@1234`);
  console.log(`Citizen login: rahul@example.com / Citizen@1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

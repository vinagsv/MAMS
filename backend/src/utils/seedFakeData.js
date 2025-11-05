require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// Models
const Base = require("../models/Base");
const EquipmentType = require("../models/EquipmentType");
const Purchase = require("../models/Purchase");
const Transfer = require("../models/Transfer");
const Assignment = require("../models/Assignment");
const AuditLog = require("../models/AuditLog");

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("🌍 Connected to MongoDB");

  // Clear all old data
  await Promise.all([
    Base.deleteMany({}),
    EquipmentType.deleteMany({}),
    Purchase.deleteMany({}),
    Transfer.deleteMany({}),
    Assignment.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log("🧹 Cleared old data");

  // Bases
  const baseNames = ["Base Alpha", "Base Bravo", "Base Charlie", "Base Delta"];
  const bases = await Base.insertMany(
    baseNames.map((name) => ({
      name,
      location: faker.location.city(),
    }))
  );
  console.log(`🏢 Created ${bases.length} bases`);

  // Equipment Types
  const equipments = [
    "Rifles",
    "Tanks",
    "Ammo Boxes",
    "Jeep Vehicles",
    "Helicopters",
    "Radar Units",
    "Missile Launchers",
    "Communication Kits",
  ];
  const equipmentDocs = await EquipmentType.insertMany(
    equipments.map((name) => ({ name, active: true }))
  );
  console.log(`Created ${equipmentDocs.length} equipment types`);

  // Helper functions
  const randomBase = () => faker.helpers.arrayElement(baseNames);
  const randomEquipment = () => faker.helpers.arrayElement(equipments);
  const randomType = () => faker.helpers.arrayElement(["assigned", "expended"]);

  const randomDate = () =>
    faker.date.between({
      from: new Date("2025-01-01"),
      to: new Date(),
    });

  // Purchases
  const purchases = Array.from({ length: 30 }).map(() => ({
    date: randomDate(),
    base: randomBase(),
    equipment: randomEquipment(),
    quantity: faker.number.int({ min: 5, max: 100 }),
    supplier: faker.company.name(),
    cost: faker.number.int({ min: 10000, max: 2000000 }),
    createdBy: faker.internet.email(),
  }));
  await Purchase.insertMany(purchases);
  console.log(`Created ${purchases.length} purchases`);

  // Transfers
  const transfers = Array.from({ length: 20 }).map(() => {
    const fromBase = faker.helpers.arrayElement(baseNames);
    const toBase = faker.helpers.arrayElement(
      baseNames.filter((b) => b !== fromBase)
    );
    return {
      date: randomDate(),
      from: fromBase,
      to: toBase,
      equipment: randomEquipment(),
      quantity: faker.number.int({ min: 1, max: 50 }),
    };
  });
  await Transfer.insertMany(transfers);
  console.log(`Created ${transfers.length} transfers`);

  // Assignments (assigned + expended)
  const assignments = Array.from({ length: 25 }).map(() => ({
    date: randomDate(),
    base: randomBase(),
    equipment: randomEquipment(),
    type: randomType(),
    quantity: faker.number.int({ min: 1, max: 30 }),
    personnel: faker.person.fullName(),
    remarks: faker.lorem.words(3),
  }));
  await Assignment.insertMany(assignments);
  console.log(`Created ${assignments.length} assignments`);

  // Audit Logs
  const actions = [
    "CREATE_PURCHASE",
    "CREATE_TRANSFER",
    "CREATE_ASSIGNMENT",
    "TOGGLE_EQUIPMENT_TYPE",
  ];
  const auditLogs = Array.from({ length: 20 }).map(() => ({
    user: faker.internet.email(),
    userRole: faker.helpers.arrayElement(["admin", "logistics", "commander"]),
    action: faker.helpers.arrayElement(actions),
    details: JSON.stringify({
      equipment: randomEquipment(),
      base: randomBase(),
      quantity: faker.number.int({ min: 1, max: 40 }),
    }),
    timestamp: randomDate(),
  }));
  await AuditLog.insertMany(auditLogs);
  console.log(`🪵 Created ${auditLogs.length} audit logs`);

  console.log("\nFake data generation complete!");
  console.log(
    "...You can now run: npm start and explore the Dashboard with new data.\n"
  );

  process.exit();
}

// Run seed
seed().catch((err) => {
  console.error("Seeding failed, try adding manually :)", err);
  process.exit(1);
});

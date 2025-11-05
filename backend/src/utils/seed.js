require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Base = require("../models/Base");

const MONGO_URI = process.env.MONGODB_URI;

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    // Create bases
    const bases = [
      { name: "Base Alpha", location: "Bangalore" },
      { name: "Base Bravo", location: "Mysore" },
    ];

    const createdBases = [];
    for (const b of bases) {
      let existing = await Base.findOne({ name: b.name });
      if (!existing) {
        const newBase = await Base.create(b);
        console.log(`Created base: ${b.name}`);
        createdBases.push(newBase);
      } else {
        console.log(`Base already exists: ${b.name}`);
        createdBases.push(existing);
      }
    }

    const users = [
      {
        name: "Admin",
        email: "admin@test.com",
        password: "123456",
        role: "admin",
      },
      {
        name: "Logistics Officer",
        email: "log@test.com",
        password: "123456",
        role: "logistics",
      },
      {
        name: "Commander Alpha",
        email: "cmdr@test.com",
        password: "123456",
        role: "commander",
        assignedBase: createdBases[0]._id,
      },
    ];

    for (const u of users) {
      const existingUser = await User.findOne({ email: u.email });
      if (existingUser) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const newUser = new User(u);
      await newUser.save();
      console.log(`Created user: ${u.email} (${u.role})`);
    }

    console.log("\n Seeding complete!");
    console.log("Login credentials:");
    console.log("Admin:     admin@test.com / 123456");
    console.log("Logistics: log@test.com / 123456");
    console.log("Commander: cmdr@test.com / 123456");

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedData();

import mongoose from "mongoose";
import BillingCustomer from "../models/BillingCustomer.js";

export async function runCustomerMigration() {
  const report = {
    oldCustomersFound: 0,
    migrated: 0,
    skipped: 0,
    conflicts: []
  };

  try {
    const db = mongoose.connection.db;

    // Check if customers collection exists
    const collections = await db.listCollections({ name: 'customers' }).toArray();
    if (collections.length === 0) {
      console.log('No "customers" collection found in database.');
      return report;
    }

    const legacyCustomers = await db.collection('customers').find({}).toArray();
    report.oldCustomersFound = legacyCustomers.length;

    console.log(`Found ${report.oldCustomersFound} legacy customer(s) to process.`);

    for (const oldCust of legacyCustomers) {
      try {
        const rawName = (oldCust.customerName || '').trim();
        if (!rawName) {
          report.conflicts.push({
            id: oldCust._id,
            reason: 'Legacy customer record has empty customerName',
            data: oldCust
          });
          continue;
        }

        // Check if customer already exists in billingcustomers (case-insensitive)
        const existing = await BillingCustomer.findOne({
          customerName: { $regex: new RegExp(`^${rawName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existing) {
          report.skipped++;
          console.log(`Skipped existing customer: "${rawName}" (matches ID: ${existing._id})`);
          continue;
        }

        // Map fields safely
        const emailId = (oldCust.customerEmail || '').trim();
        const gstNumber = (oldCust.customerGstNo || '').trim();
        const billingAddress = (oldCust.customerShpAddress || '').trim();
        const shippingAddress = (oldCust.customerShpAddress || '').trim();
        const placeOfSupply = (oldCust.customerPlaceofSupply || '').trim();
        const location = billingAddress || placeOfSupply || '';

        const newDoc = new BillingCustomer({
          customerName: rawName,
          gstNumber,
          emailId,
          location,
          billingAddress,
          shippingAddress,
          placeOfSupply
        });

        await newDoc.save();
        report.migrated++;
        console.log(`Successfully migrated customer: "${rawName}"`);
      } catch (itemErr) {
        report.conflicts.push({
          id: oldCust._id,
          name: oldCust.customerName,
          reason: itemErr.message
        });
      }
    }

    return report;
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

// Standalone runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('migrateCustomers.mjs')) {
  (async () => {
    try {
      if (!process.env.mongoURI) {
        throw new Error('mongoURI not defined in environment');
      }
      await mongoose.connect(process.env.mongoURI);
      console.log('Connected to MongoDB. Running customer migration...');
      const summary = await runCustomerMigration();
      console.log('\n--- MIGRATION SUMMARY ---');
      console.log(`Old customers found: ${summary.oldCustomersFound}`);
      console.log(`Migrated: ${summary.migrated}`);
      console.log(`Skipped (already present): ${summary.skipped}`);
      console.log(`Conflicts/Errors: ${summary.conflicts.length}`);
      if (summary.conflicts.length > 0) {
        console.log('Conflicts details:', JSON.stringify(summary.conflicts, null, 2));
      }
    } catch (err) {
      console.error('Migration runner failed:', err.message);
    } finally {
      await mongoose.disconnect();
    }
  })();
}

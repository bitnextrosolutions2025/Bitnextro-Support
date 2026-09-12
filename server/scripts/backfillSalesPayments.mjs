import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import Sale from '../models/Sale.js';

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitnextro-support';
    await mongoose.connect(mongoUri);
    console.log("Connected securely.");

    const sales = await Sale.find({});
    console.log(`Found ${sales.length} total records.`);

    let backfilledPaid = 0;
    let backfilledUnpaid = 0;
    let skippedPartiallyPaid = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    const bulkOps = [];

    for (const sale of sales) {
      const salesAmount = sale.salesAmount || 0;
      
      let isAlreadyCorrect = false;
      if (sale.paymentStatus === 'Paid' && sale.amountReceived === salesAmount && sale.balanceDue === 0) {
         isAlreadyCorrect = true;
      }
      if (sale.paymentStatus === 'Unpaid' && sale.amountReceived === 0 && sale.balanceDue === salesAmount) {
         isAlreadyCorrect = true;
      }

      if (isAlreadyCorrect) {
        alreadyCorrect++;
        continue;
      }

      if (sale.paymentStatus === 'Partially Paid') {
        skippedPartiallyPaid++;
        console.log(`SKIPPED: Invoice ${sale.invoiceNumber} is Partially Paid. Manual review required.`);
        continue;
      }

      if (sale.paymentStatus === 'Paid') {
        bulkOps.push({
          updateOne: {
            filter: { _id: sale._id },
            update: {
              $set: {
                amountReceived: parseFloat(salesAmount.toFixed(2)),
                balanceDue: 0
              }
            }
          }
        });
        backfilledPaid++;
      } else if (sale.paymentStatus === 'Unpaid') {
        bulkOps.push({
          updateOne: {
            filter: { _id: sale._id },
            update: {
              $set: {
                amountReceived: 0,
                balanceDue: parseFloat(salesAmount.toFixed(2))
              }
            }
          }
        });
        backfilledUnpaid++;
      } else {
         errors++;
      }
    }

    if (bulkOps.length > 0) {
      console.log(`Executing ${bulkOps.length} bulk updates...`);
      await Sale.collection.bulkWrite(bulkOps);
    }

    console.log("\n--- MIGRATION SUMMARY ---");
    console.log(`Total records scanned: ${sales.length}`);
    console.log(`Paid records backfilled: ${backfilledPaid}`);
    console.log(`Unpaid records backfilled: ${backfilledUnpaid}`);
    console.log(`Partially Paid records skipped: ${skippedPartiallyPaid}`);
    console.log(`Records already correct (Idempotent): ${alreadyCorrect}`);
    console.log(`Errors encountered: ${errors}`);
    console.log("-------------------------\n");

  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Only run automatically if executed directly from CLI, otherwise export
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}

export { runMigration };

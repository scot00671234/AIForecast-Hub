
import { accuracyCalculator } from '../server/services/accuracyCalculator';
import { storage } from '../server/storage';

async function verifyAccuracyFix() {
    console.log("🔍 Verifying Accuracy Calculation Fix...");

    try {
        // 1. Get recent predictions for a commodity
        const commodities = await storage.getCommodities();
        const commodity = commodities[0]; // Just check the first one
        console.log(`Checking commodity: ${commodity.name} (${commodity.id})`);

        const predictions = await storage.getPredictions(commodity.id);
        console.log(`Found ${predictions.length} total predictions`);

        // 2. Filter for relevant predictions (past target dates)
        const now = new Date();
        const targetPredictions = predictions.filter(p => new Date(p.targetDate) <= now);
        console.log(`Found ${targetPredictions.length} predictions with past target dates`);

        if (targetPredictions.length === 0) {
            console.log("⚠️ No predictions with past target dates found. Cannot verify accuracy.");

            // Check for future predictions
            const futurePredictions = predictions.filter(p => new Date(p.targetDate) > now);
            console.log(`Found ${futurePredictions.length} predictions with FUTURE target dates.`);
            if (futurePredictions.length > 0) {
                console.log("Sample future prediction:", futurePredictions[0]);
                console.log("Target Date:", new Date(futurePredictions[0].targetDate).toISOString());
                console.log("Current Date:", now.toISOString());
            }
            return;
        }

        // 3. Get actual prices
        const actualPrices = await storage.getActualPrices(commodity.id, 100);
        console.log(`Found ${actualPrices.length} actual price records`);

        // 4. Run calculation
        console.log("\nRunning accuracy calculation...");
        const result = await accuracyCalculator.calculateAccuracy(predictions, actualPrices);

        if (result) {
            console.log("\n✅ Accuracy Calculation SUCCESS!");
            console.log("--------------------------------------------------");
            console.log(`Matched Predictions: ${result.totalPredictions}`); // Should match number of valid past target dates
            console.log(`Accuracy Score:      ${result.accuracy.toFixed(2)}%`);
            console.log(`MAPE:                ${result.mape.toFixed(2)}%`);
            console.log(`Directional Acc:     ${result.directionalAccuracy.toFixed(2)}%`);
            console.log("--------------------------------------------------");

            if (result.totalPredictions > 0) {
                console.log("✅ Fix Verified: The calculator is successfully matching predictions to target dates!");
            } else {
                console.log("⚠️ Result returned but 0 predictions matched. Check date matching tolerance.");
            }
        } else {
            console.log("\n⚠️ Calculation returned null (insufficient data or no matches)");
        }

    } catch (error) {
        console.error("❌ Verification failed:", error);
    } finally {
        process.exit();
    }
}

// Mock some parts if needed, but since we're in the project structure, we can try running it directly
// We might need to handle DB connection if it's not auto-connected by imports
console.log("Starting verification...");
verifyAccuracyFix();

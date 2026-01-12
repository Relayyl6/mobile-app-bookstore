// jobs/preferenceCleanup.job.js
import cron from 'node-cron';
import { cleanupExpiredAuthors } from './utils.js';

/**
 * Schedule cleanup to run every day at 2:00 AM
 */
export const startPreferenceCleanupJob = () => {
  // Cron expression: minute hour day month dayOfWeek
  // '0 2 * * *' = 2:00 AM every day
    cron.schedule('0 2 * * *', async () => {
        console.log('⏰ Starting scheduled preference cleanup...');
        try {
            const result = await cleanupExpiredAuthors();
            console.log(`Cleanup completed:`, result);
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }, {
        timezone: "UTC" // Adjust to your timezone
    });

    console.log('Preference cleanup job scheduled (runs daily at 2:00 AM)');
};

// Optional: Manual cleanup endpoint for testing
export const manualCleanup = async (req, res, next) => {
  try {
    console.log('Manual cleanup triggered');
    const result = await cleanupExpiredAuthors();
    
    res.status(200).json({
      success: true,
      message: 'Cleanup completed',
      result
    });
  } catch (error) {
    next(error);
  }
};
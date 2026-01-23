// jobs/preferenceCleanup.job.js
import cron from 'node-cron';
import axios from 'axios';
import { cleanupExpiredAuthors } from './utils.js';

// Track job instances to prevent duplicates
let cleanupJob = null;
let healthCheckJob = null;

/**
 * Schedule cleanup to run every day at 2:00 AM
 */
export const startPreferenceCleanupJob = () => {
  // Prevent duplicate jobs
  if (cleanupJob) {
    console.log('Cleanup job already running, skipping...');
    return;
  }

  // Cron expression: minute hour day month dayOfWeek
  // '0 2 * * *' = 2:00 AM every day
  cleanupJob = cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Starting scheduled preference cleanup...');
    try {
      const result = await cleanupExpiredAuthors();
      console.log(`Cleanup completed:`, result);
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
  }, {
    timezone: "UTC", // Adjust to your timezone
    scheduled: true
  });

  console.log('Preference cleanup job scheduled (runs daily at 2:00 AM UTC)');
};

/**
 * Health check: Send HTTP GET request to health route every 14 minutes
 */
export const startHealthCheckJob = () => {
  // Prevent duplicate jobs
  if (healthCheckJob) {
    console.log('Health check job already running, skipping...');
    return;
  }

  const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/api/health';
  
  // Cron expression: '*/14 * * * *' = every 14 minutes
  healthCheckJob = cron.schedule('*/14 * * * *', async () => {
    try {
      const response = await axios.post(HEALTH_CHECK_URL, { 
        timeout: 10000, // Increased timeout to 10 seconds
        headers: {
          'User-Agent': 'Health-Check-Cron'
        }
      });
      
      if (response.status === 200) {
        console.log(`Health check passed [${new Date().toISOString()}]`);
      } else {
        console.warn(`Health check returned status ${response.status}`);
      }
    } catch (error) {
      // More detailed error logging
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Health check failed: Server not available (ECONNREFUSED)');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ Health check failed: Request timed out');
      } else if (error.response) {
        console.error(`❌ Health check failed: HTTP ${error.response.status}`);
      } else {
        console.error('❌ Health check failed:', error.message);
      }
    }
  }, {
    timezone: "UTC",
    scheduled: true
  });

  console.log(`Health check job scheduled (pings ${HEALTH_CHECK_URL} every 14 minutes)`);
};

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
export const stopAllJobs = () => {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    console.log('Cleanup job stopped');
  }
  if (healthCheckJob) {
    healthCheckJob.stop();
    healthCheckJob = null;
    console.log('Health check job stopped');
  }
};

/**
 * Optional: Manual cleanup endpoint for testing
 */
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
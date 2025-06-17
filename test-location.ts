import { LocationService } from './services/locationService';

// Test script to verify location service functionality
async function testLocationService() {
  console.log('Testing Location Service...');
  
  try {
    console.log('Attempting to get location from IP...');
    const location = await LocationService.getLocationAuto();
    
    if (location) {
      console.log('✅ Location detected successfully:');
      console.log(`  Address: ${location.address}`);
      console.log(`  Coordinates: ${LocationService.formatCoordinates(location.latitude, location.longitude)}`);
      console.log(`  City: ${location.city}`);
      console.log(`  Region: ${location.region}`);
      console.log(`  Country: ${location.country}`);
    } else {
      console.log('❌ Location detection failed');
    }
  } catch (error) {
    console.error('❌ Error testing location service:', error);
  }
}

// Uncomment to run test (not for production)
// testLocationService();

export { testLocationService };

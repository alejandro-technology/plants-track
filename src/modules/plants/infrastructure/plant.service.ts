import { PlantRepository } from '../domain/plant.repository';
import plantHttpService from './plant.http.service';
import plantFirebaseService from './plant.firebase.service';
import plantMockService from './plant.mock.service';
import { CONFIG } from '@config/config';

/**
 * Plant Service Factory
 *
 * This factory returns the appropriate PlantRepository implementation
 * based on the SERVICE_PROVIDER configuration.
 *
 * To switch between implementations, update the SERVICE_PROVIDER
 * constant in config/config.ts
 */
function createPlantService(): PlantRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return plantHttpService;
    case 'firebase':
      return plantFirebaseService;
    case 'mock':
      return plantMockService;
    default:
      throw new Error(
        `Unknown plant service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}

export default createPlantService();

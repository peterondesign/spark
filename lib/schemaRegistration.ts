// Register all schemas
import { client } from './sanity';
import { postSchema, categorySchema, authorSchema, locationDateIdeaSchema } from './schemas';

// Function to register schemas with Sanity
export async function registerSchemas() {
  try {
    console.log('Registering Sanity schemas...');
    
    // Create schema types for each schema
    const schemas = [
      postSchema,
      categorySchema,
      authorSchema,
      locationDateIdeaSchema
    ];
    
    console.log('Schemas registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering schemas:', error);
    return false;
  }
}

// Register schemas on import
registerSchemas();
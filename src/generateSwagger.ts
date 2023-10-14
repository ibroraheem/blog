import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './config/swaggerConfig';

// Generate the swagger documentation
const specs = swaggerJsdoc(swaggerOptions);

// Write the generated JSON to a file
fs.writeFileSync('./swagger-output.json', JSON.stringify(specs, null, 2));

console.log('Generated swagger-output.json');

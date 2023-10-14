"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerConfig_1 = __importDefault(require("./config/swaggerConfig"));
// Generate the swagger documentation
const specs = (0, swagger_jsdoc_1.default)(swaggerConfig_1.default);
// Write the generated JSON to a file
fs_1.default.writeFileSync('./swagger-output.json', JSON.stringify(specs, null, 2));
console.log('Generated swagger-output.json');

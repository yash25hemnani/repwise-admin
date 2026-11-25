import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL is not set');
}

// Reads CLOUDINARY_URL; secure gives https URLs
cloudinary.config({ secure: true });

export { cloudinary };

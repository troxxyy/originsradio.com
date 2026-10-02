import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN;
if (!mediaOrigin && (!supabaseUrl || !supabaseServiceKey)) {
  console.error('Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = mediaOrigin ? null : createClient(supabaseUrl, supabaseServiceKey);

async function uploadImage(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`File not found: ${imagePath}`);
      process.exit(1);
    }

    // Read the file
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `tomorrowland-thailand-${timestamp}${fileExt}`;
    const filePath = `blogs/${uniqueFileName}`;

    if (mediaOrigin) {
      const { R2_ACCOUNT_ID: account, R2_BUCKET: bucket, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
      if (!account || !bucket || !accessKeyId || !secretAccessKey) throw new Error('Missing server-side R2 configuration');
      const contentType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' }[fileExt.toLowerCase()];
      if (!contentType || fileBuffer.length > 30 * 1024 * 1024) throw new Error('Unsupported image type or size');
      const client = new S3Client({ region: 'auto', endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey }, requestChecksumCalculation: 'WHEN_REQUIRED' });
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: `images/${filePath}`, Body: fileBuffer, ContentType: contentType, CacheControl: 'public, max-age=3600', IfNoneMatch: '*' }));
      const publicUrl = `${mediaOrigin.replace(/\/$/, '')}/images/${filePath.split('/').map(encodeURIComponent).join('/')}`;
      console.log('Upload successful:', publicUrl);
      return publicUrl;
    }
    console.log(`Uploading ${fileName} to Supabase Storage...`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, fileBuffer, {
        contentType: `image/${fileExt.slice(1)}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      process.exit(1);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    console.log('✅ Upload successful!');
    console.log('Public URL:', publicUrl);
    console.log('\nYou can now use this URL as the cover_image_url for your blog post.');

    return publicUrl;
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get image path from command line argument
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('Usage: node scripts/upload-blog-image.js <path-to-image>');
  console.error('Example: node scripts/upload-blog-image.js public/BLOGIMAGES/tomorrowland.jpg');
  process.exit(1);
}

uploadImage(imagePath).then(() => process.exit(0)).catch(() => process.exit(1));


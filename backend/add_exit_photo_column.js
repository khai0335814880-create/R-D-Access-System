const pool = require('./src/config/database');
async function addExitPhotoColumn() {
  try {
    await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS exit_face_image_url TEXT');
    console.log('✓ Added exit_face_image_url column to sessions table');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
addExitPhotoColumn();

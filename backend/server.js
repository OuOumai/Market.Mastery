// backend/server.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const COURSES_DIR = path.join(__dirname, 'courses');

// Allow requests from your frontend dev server (default localhost:5173 for Vite)
app.use(cors());

// Serve the actual files (PDFs, videos) under /courses/...
app.use('/courses', express.static(COURSES_DIR));

/**
 * Helper: read directory and return only directories (no files)
 */
async function readdirDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(d => d.name);
}

/**
 * Build a JSON representation of courses -> chapters -> lectures
 */
async function buildCourses() {
  const courses = [];
  let courseNames;
  try {
    courseNames = await readdirDirs(COURSES_DIR);
  } catch (err) {
    // If courses folder doesn't exist, return empty
    return [];
  }

  for (const courseName of courseNames) {
    const coursePath = path.join(COURSES_DIR, courseName);
    const chapterNames = await readdirDirs(coursePath);

    const chapters = [];
    for (const chapterName of chapterNames) {
      const chapterPath = path.join(coursePath, chapterName);
      const files = await fs.readdir(chapterPath, { withFileTypes: true });

      const lectures = [];
      for (const f of files) {
        if (!f.isFile()) continue;
        const fileName = f.name;
        const ext = path.extname(fileName).toLowerCase();
        let type = 'other';
        if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) type = 'video';
        else if (ext === '.pdf') type = 'pdf';
        else if (['.mp3', '.wav'].includes(ext)) type = 'audio';

        // Build a safe URL for the frontend to fetch (encode each segment)
        const url =
          '/courses/' +
          encodeURIComponent(courseName) + '/' +
          encodeURIComponent(chapterName) + '/' +
          encodeURIComponent(fileName);

        lectures.push({
          name: fileName,
          type,
          url
        });
      }

      chapters.push({
        name: chapterName,
        lectures
      });
    }

    courses.push({
      name: courseName,
      chapters
    });
  }

  return courses;
}

// API: get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const data = await buildCourses();
    res.json(data);
  } catch (err) {
    console.error('Error building courses:', err);
    res.status(500).json({ error: 'Failed to read courses' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

// Keep the process alive and handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test the courses endpoint immediately
setTimeout(async () => {
  try {
    console.log('Testing courses endpoint...');
    const courses = await buildCourses();
    console.log(`Found ${courses.length} courses:`, courses.map(c => c.name));
  } catch (err) {
    console.error('Error testing courses:', err);
  }
}, 1000);
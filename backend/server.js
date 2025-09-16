const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Course storage path
const COURSES_PATH = path.join(__dirname, 'courses');

// Ensure courses directory exists
async function ensureCoursesDirectory() {
  try {
    await fs.access(COURSES_PATH);
  } catch (error) {
    await fs.mkdir(COURSES_PATH, { recursive: true });
  }
}

// Helper function to sanitize folder names
function sanitizeFolderName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}

// Helper function to get file extension
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// Helper function to determine file type
function getFileType(filename) {
  const ext = getFileExtension(filename);
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  const pdfExtensions = ['.pdf'];
  
  if (videoExtensions.includes(ext)) return 'video';
  if (pdfExtensions.includes(ext)) return 'pdf';
  return 'other';
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseFolder, chapterName } = req.params;
    const chapterPath = path.join(COURSES_PATH, courseFolder, chapterName);
    
    // Create directories if they don't exist
    fs.mkdir(chapterPath, { recursive: true })
      .then(() => cb(null, chapterPath))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const ext = getFileExtension(file.originalname);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and video files are allowed.'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// API Routes

// Create a new course
app.post('/api/courses', async (req, res) => {
  try {
    const { name, description, instructor, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    const sanitizedTitle = sanitizeFolderName(name);
    const coursePath = path.join(COURSES_PATH, sanitizedTitle);
    
    // Check if course already exists
    try {
      await fs.access(coursePath);
      return res.status(409).json({ error: 'Course with this title already exists' });
    } catch (error) {
      // Course doesn't exist, continue with creation
    }

    // Create course directory
    await fs.mkdir(coursePath, { recursive: true });
    
    // Create course.json file with metadata
    const courseData = {
      title: name,
      description: description || '',
      instructor: instructor || '',
      category: category || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: []
    };
    
    const courseJsonPath = path.join(coursePath, 'course.json');
    await fs.writeFile(courseJsonPath, JSON.stringify(courseData, null, 2));
    
    res.status(201).json({ 
      message: 'Course created successfully', 
      course: courseData,
      folderName: sanitizedTitle 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    await ensureCoursesDirectory();
    
    const courses = [];
    const courseFolders = await fs.readdir(COURSES_PATH);
    
    for (const folder of courseFolders) {
      const coursePath = path.join(COURSES_PATH, folder);
      const stat = await fs.stat(coursePath);
      
      if (stat.isDirectory()) {
        const courseJsonPath = path.join(coursePath, 'course.json');
        
        try {
          const courseData = await fs.readFile(courseJsonPath, 'utf8');
          const course = JSON.parse(courseData);
          course.folderName = folder;
          courses.push(course);
        } catch (error) {
          // If course.json doesn't exist, create a basic course object
          const basicCourse = {
            title: folder,
            description: '',
            instructor: '',
            category: '',
            createdAt: new Date().toISOString(),
            folderName: folder,
            chapters: []
          };
          courses.push(basicCourse);
        }
      }
    }
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course details with chapters and files
app.get('/api/courses/:courseFolder', async (req, res) => {
  try {
    const { courseFolder } = req.params;
    const coursePath = path.join(COURSES_PATH, courseFolder);
    
    // Check if course exists
    try {
      await fs.access(coursePath);
    } catch (error) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Read course metadata
    const courseJsonPath = path.join(coursePath, 'course.json');
    let courseData = {};
    
    try {
      const courseJson = await fs.readFile(courseJsonPath, 'utf8');
      courseData = JSON.parse(courseJson);
    } catch (error) {
      courseData = {
        title: courseFolder,
        description: '',
        instructor: '',
        category: ''
      };
    }

    // Read chapters (subdirectories)
    const items = await fs.readdir(coursePath);
    const chapters = [];
    
    for (const item of items) {
      if (item === 'course.json') continue;
      
      const itemPath = path.join(coursePath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // This is a chapter folder
        const chapterFiles = await fs.readdir(itemPath);
        const files = [];
        
        for (const file of chapterFiles) {
          const filePath = path.join(itemPath, file);
          const fileStat = await fs.stat(filePath);
          
          if (fileStat.isFile()) {
            files.push({
              name: file,
              type: getFileType(file),
              size: fileStat.size,
              path: `/api/files/${courseFolder}/${item}/${file}`
            });
          }
        }
        
        chapters.push({
          name: item,
          files: files
        });
      }
    }
    
    // Sort chapters by name
    chapters.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      ...courseData,
      folderName: courseFolder,
      chapters: chapters
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Upload files to a chapter
app.post('/api/courses/:courseFolder/chapters/:chapterName/upload', 
  upload.array('files', 12), // Added a limit to match the frontend
  async (req, res) => {
    try {
      const { courseFolder, chapterName } = req.params;
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const uploadedFiles = files.map(file => ({
        name: file.filename,
        type: getFileType(file.filename),
        size: file.size,
        path: `/api/files/${courseFolder}/${chapterName}/${file.filename}`
      }));
      
      res.json({ 
        message: 'Files uploaded successfully',
        files: uploadedFiles 
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  }
);

// Serve files
app.get('/api/files/:courseFolder/:chapterName/:fileName', async (req, res) => {
  try {
    const { courseFolder, chapterName, fileName } = req.params;
    const filePath = path.join(COURSES_PATH, courseFolder, chapterName, fileName);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers based on file type
    const fileType = getFileType(fileName);
    if (fileType === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (fileType === 'video') {
      res.setHeader('Content-Type', 'video/mp4'); // Default to mp4, adjust as needed
    }
    
    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Create a new chapter
app.post('/api/courses/:courseFolder/chapters', async (req, res) => {
  try {
    const { courseFolder } = req.params;
    const { chapterName } = req.body;
    
    if (!chapterName) {
      return res.status(400).json({ error: 'Chapter name is required' });
    }
    
    const coursePath = path.join(COURSES_PATH, courseFolder);
    const sanitizedChapterName = sanitizeFolderName(chapterName);
    const chapterPath = path.join(coursePath, sanitizedChapterName);
    
    // Check if chapter already exists
    try {
      await fs.access(chapterPath);
      return res.status(409).json({ error: 'Chapter with this name already exists' });
    } catch (error) {
      // Chapter doesn't exist, continue with creation
    }
    
    // Create chapter directory
    await fs.mkdir(chapterPath, { recursive: true });
    
    res.status(201).json({ 
      message: 'Chapter created successfully',
      chapterName: sanitizedChapterName 
    });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// Initialize server
ensureCoursesDirectory()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Courses directory: ${COURSES_PATH}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize server:', error);
  });
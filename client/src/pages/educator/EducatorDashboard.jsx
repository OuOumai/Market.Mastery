import React, { useState, useEffect } from 'react';
import './EducatorDashboard.css';

const EducatorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    category: ''
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapterName, setChapterName] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);

  // Fetch educator's courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/courses');
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Course title is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Course created successfully!');
        setFormData({
          name: '',
          description: '',
          instructor: '',
          category: ''
        });
        setShowCreateForm(false);
        fetchCourses(); // Refresh the courses list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (courseFolder) => {
    if (!chapterName.trim()) {
      alert('Chapter name is required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseFolder}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chapterName })
      });

      if (response.ok) {
        alert('Chapter created successfully!');
        setChapterName('');
        fetchCourses(); // Refresh courses to show new chapter
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create chapter');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      alert('Failed to create chapter');
    }
  };

  const handleFileUpload = async (courseFolder, chapterName) => {
    if (uploadFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    const formData = new FormData();
    uploadFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseFolder}/chapters/${chapterName}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (response.ok) {
        alert('Files uploaded successfully!');
        setUploadFiles([]);
        fetchCourses(); // Refresh to show new files
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    }
  };

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  if (loading && courses.length === 0) {
    return (
      <div className="educator-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="educator-dashboard">
      <div className="dashboard-header">
        <h1>Educator Dashboard</h1>
        <button 
          className="create-course-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Course'}
        </button>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="create-course-form">
          <h2>Create New Course</h2>
          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label htmlFor="name">Course Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter course title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="instructor">Instructor</label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="Enter instructor name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter course category"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="courses-section">
        <h2>Your Courses</h2>
        {courses.length === 0 ? (
          <p>No courses found. Create your first course!</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.folderName} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>Instructor: {course.instructor || 'N/A'}</span>
                  <span>Category: {course.category || 'N/A'}</span>
                  <span>Chapters: {course.chapters?.length || 0}</span>
                </div>
                
                <div className="course-actions">
                  <button 
                    onClick={() => setSelectedCourse(
                      selectedCourse === course.folderName ? null : course.folderName
                    )}
                  >
                    {selectedCourse === course.folderName ? 'Hide Details' : 'Manage Course'}
                  </button>
                </div>

                {/* Course Management Panel */}
                {selectedCourse === course.folderName && (
                  <div className="course-management">
                    {/* Create Chapter */}
                    <div className="chapter-creation">
                      <h4>Create New Chapter</h4>
                      <div className="chapter-form">
                        <input
                          type="text"
                          value={chapterName}
                          onChange={(e) => setChapterName(e.target.value)}
                          placeholder="Chapter name (e.g., Chapter 1 - Introduction)"
                        />
                        <button 
                          onClick={() => handleCreateChapter(course.folderName)}
                        >
                          Create Chapter
                        </button>
                      </div>
                    </div>

                    {/* Existing Chapters */}
                    {course.chapters && course.chapters.length > 0 && (
                      <div className="chapters-list">
                        <h4>Existing Chapters</h4>
                        {course.chapters.map((chapter) => (
                          <div key={chapter.name} className="chapter-item">
                            <h5>{chapter.name}</h5>
                            <p>Files: {chapter.files.length}</p>
                            
                            {/* File Upload for this chapter */}
                            <div className="file-upload">
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                                onChange={handleFileChange}
                              />
                              <button 
                                onClick={() => handleFileUpload(course.folderName, chapter.name)}
                              >
                                Upload Files
                              </button>
                            </div>

                            {/* Show existing files */}
                            {chapter.files.length > 0 && (
                              <div className="chapter-files">
                                <h6>Files:</h6>
                                <ul>
                                  {chapter.files.map((file) => (
                                    <li key={file.name}>
                                      {file.name} ({file.type})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorDashboard;
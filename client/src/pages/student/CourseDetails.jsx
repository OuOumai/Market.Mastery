import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseStructure from '../../components/student/CourseStructure';
import PDFViewer from '../../components/student/PDFViewer';
import VideoPlayer from '../../components/student/VideoPlayer';
import Loading from '../../components/student/Loading';
import './CourseDetails.css';
import { AppContext } from '../../context/AppContext';

const CourseDetails = () => {
  const { courseFolder } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('structure'); // 'structure', 'pdf', 'video'
  const { API_BASE_URL } = useContext(AppContext);

  useEffect(() => {
    if (courseFolder) {
      fetchCourseDetails();
    }
  }, [courseFolder]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseFolder}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found');
        }
        throw new Error('Failed to fetch course details');
      }
      
      const courseData = await response.json();
      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file.type === 'pdf') {
      setViewMode('pdf');
    } else if (file.type === 'video') {
      setViewMode('video');
    }
  };

  const handleBackToStructure = () => {
    setViewMode('structure');
    setSelectedFile(null);
  };

  const handleBackToCourses = () => {
    navigate('/student/courses');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalResources = () => {
    if (!course?.chapters) return 0;
    return course.chapters.reduce((total, chapter) => total + (chapter.files ? chapter.files.length : 0), 0);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="course-details">
        <div className="error-message">
          <h2>Error Loading Course</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchCourseDetails} className="retry-btn">
              Try Again
            </button>
            <button onClick={handleBackToCourses} className="back-btn">
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-details">
        <div className="no-course">
          <h2>Course Not Found</h2>
          <button onClick={handleBackToCourses} className="back-btn">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details">
      {/* Course Header */}
      <div className="course-header">
        <div className="header-navigation">
          <button onClick={handleBackToCourses} className="back-btn">
            ← Back to Courses
          </button>
          {viewMode !== 'structure' && (
            <button onClick={handleBackToStructure} className="structure-btn">
              ← Back to Course Structure
            </button>
          )}
        </div>
        
        <div className="course-info">
          <h1 className="course-title">{course.title}</h1>
          {course.description && (
            <p className="course-description">{course.description}</p>
          )}
          
          <div className="course-meta">
            <div className="meta-item">
              <span className="meta-label">Instructor:</span>
              <span className="meta-value">{course.instructor || 'N/A'}</span>
            </div>
            {course.category && (
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{course.category}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Chapters:</span>
              <span className="meta-value">{course.chapters?.length || 0}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Resources:</span>
              <span className="meta-value">{getTotalResources()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span className="meta-value">{formatDate(course.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="course-content">
        {viewMode === 'structure' && (
          <CourseStructure 
            course={course} 
            onFileSelect={handleFileSelect}
          />
        )}
        
        {viewMode === 'pdf' && selectedFile && (
          <PDFViewer 
            fileUrl={`${API_BASE_URL}${selectedFile.path}`}
            fileName={selectedFile.name}
            onClose={handleBackToStructure}
          />
        )}
        
        {viewMode === 'video' && selectedFile && (
          <VideoPlayer 
            videoUrl={`${API_BASE_URL}${selectedFile.path}`}
            videoTitle={selectedFile.name}
            onClose={handleBackToStructure}
          />
        )}
      </div>

      {/* Course Progress (Future Enhancement) */}
      {viewMode === 'structure' && (
        <div className="course-progress">
          <h3>Course Progress</h3>
          <div className="progress-info">
            <p>Track your progress through the course materials.</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <span className="progress-text">0% Complete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
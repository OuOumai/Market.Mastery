import React from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onClick, onEnroll }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getChapterCount = () => {
    return course.chapters ? course.chapters.length : 0;
  };

  const getTotalFiles = () => {
    if (!course.chapters) return 0;
    return course.chapters.reduce((total, chapter) => total + (chapter.files ? chapter.files.length : 0), 0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'marketing': '#ff6b6b',
      'business': '#4ecdc4',
      'technology': '#45b7d1',
      'design': '#96ceb4',
      'finance': '#feca57',
      'management': '#ff9ff3',
      'development': '#54a0ff',
      'analytics': '#5f27cd'
    };
    
    if (!category) return '#ddd';
    return colors[category.toLowerCase()] || '#6c5ce7';
  };

  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-card-header">
        {course.category && (
          <span 
            className="course-category"
            style={{ backgroundColor: getCategoryColor(course.category) }}
          >
            {course.category}
          </span>
        )}
      </div>
      
      <div className="course-card-content">
        <h3 className="course-title">{course.title}</h3>
        
        {course.description && (
          <p className="course-description">
            {course.description.length > 120 
              ? course.description.substring(0, 120) + '...'
              : course.description
            }
          </p>
        )}
        
        {course.instructor && (
          <div className="course-instructor">
            <span className="instructor-label">Instructor:</span>
            <span className="instructor-name">{course.instructor}</span>
          </div>
        )}
      </div>
      
      <div className="course-card-stats">
        <div className="stat-item">
          <span className="stat-value">{getChapterCount()}</span>
          <span className="stat-label">Chapters</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getTotalFiles()}</span>
          <span className="stat-label">Resources</span>
        </div>
      </div>
      
      <div className="course-card-footer">
        <div className="course-dates">
          <span className="created-date">
            Created: {formatDate(course.createdAt)}
          </span>
        </div>
        
        <div className="course-actions">
          <button 
            className="enroll-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEnroll();
            }}
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
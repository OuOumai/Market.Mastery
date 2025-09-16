import React, { useState } from 'react';
import './CourseStructure.css';

const CourseStructure = ({ course, onFileSelect }) => {
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  const toggleChapter = (chapterName) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterName)) {
      newExpanded.delete(chapterName);
    } else {
      newExpanded.add(chapterName);
    }
    setExpandedChapters(newExpanded);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  if (!course) {
    return (
      <div className="course-structure">
        <div className="no-course">
          <p>No course data available</p>
        </div>
      </div>
    );
  }

  if (!course.chapters || course.chapters.length === 0) {
    return (
      <div className="course-structure">
        <div className="no-chapters">
          <h3>No Chapters Available</h3>
          <p>This course doesn't have any chapters yet. Check back later for content updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-structure">
      <div className="structure-header">
        <h2>Course Structure</h2>
        <p>Click on chapters to expand and view available resources</p>
      </div>

      <div className="chapters-container">
        {course.chapters.map((chapter, index) => (
          <div key={chapter.name} className="chapter-item">
            <div 
              className={`chapter-header ${expandedChapters.has(chapter.name) ? 'expanded' : ''}`}
              onClick={() => toggleChapter(chapter.name)}
            >
              <div className="chapter-info">
                <span className="chapter-number">{index + 1}</span>
                <h3 className="chapter-title">{chapter.name}</h3>
                <span className="chapter-count">
                  {chapter.files ? chapter.files.length : 0} files
                </span>
              </div>
              <div className="chapter-toggle">
                {expandedChapters.has(chapter.name) ? '−' : '+'}
              </div>
            </div>

            {expandedChapters.has(chapter.name) && (
              <div className="chapter-content">
                {!chapter.files || chapter.files.length === 0 ? (
                  <div className="no-files">
                    <p>No files available in this chapter</p>
                  </div>
                ) : (
                  <div className="files-list">
                    {chapter.files.map((file, fileIndex) => (
                      <div 
                        key={`${file.name}-${fileIndex}`}
                        className="file-item"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="file-icon">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-meta">
                            <span className="file-type">{file.type.toUpperCase()}</span>
                            {file.size && (
                              <>
                                <span className="file-separator">•</span>
                                <span className="file-size">{formatFileSize(file.size)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="file-action">
                          <button className="view-file-btn">
                            {file.type === 'pdf' ? 'View PDF' : 'Play Video'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Course Summary */}
      <div className="course-summary">
        <h3>Course Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-value">{course.chapters.length}</span>
            <span className="stat-label">Chapters</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {course.chapters.reduce((total, chapter) => total + (chapter.files ? chapter.files.length : 0), 0)}
            </span>
            <span className="stat-label">Total Files</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {course.chapters.reduce((total, chapter) => 
                total + (chapter.files ? chapter.files.filter(f => f.type === 'video').length : 0), 0
              )}
            </span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {course.chapters.reduce((total, chapter) => 
                total + (chapter.files ? chapter.files.filter(f => f.type === 'pdf').length : 0), 0
              )}
            </span>
            <span className="stat-label">PDFs</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="expand-all-btn"
          onClick={() => {
            const allChapters = new Set(course.chapters.map(ch => ch.name));
            setExpandedChapters(allChapters);
          }}
        >
          Expand All Chapters
        </button>
        <button 
          className="collapse-all-btn"
          onClick={() => setExpandedChapters(new Set())}
        >
          Collapse All Chapters
        </button>
      </div>
    </div>
  );
};

export default CourseStructure;
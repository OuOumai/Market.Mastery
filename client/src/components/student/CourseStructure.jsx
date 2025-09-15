import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const CourseStructure = ({ courseId, onLectureSelect, selectedLecture }) => {
  const { allCourses } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [expandedLectures, setExpandedLectures] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Find course data from context
  useEffect(() => {
    if (allCourses && allCourses.length > 0 && courseId) {
      const course = allCourses.find(c => c._id === courseId);
      if (course) {
        setCourseData(course);
        // Auto-expand first chapter
        if (course.courseContent?.length > 0) {
          setExpandedChapters(new Set([course.courseContent[0].chapterId]));
        }
        setLoading(false);
      } else {
        setError('Course not found');
        setLoading(false);
      }
    } else if (allCourses && allCourses.length === 0) {
      setError('No courses available');
      setLoading(false);
    }
  }, [allCourses, courseId]);

  // Get lecture media from course data
  const getLectureMedia = (chapterId, lectureId) => {
    if (!courseData?.courseContent) return [];
    
    const chapter = courseData.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return [];
    
    const lecture = chapter.chapterContent.find(lec => lec.lectureId === lectureId);
    if (!lecture) return [];
    
    // Return lecture data as media
    return [{
      id: lecture.lectureId,
      name: lecture.lectureTitle,
      url: lecture.lectureUrl,
      type: lecture.lectureUrl?.includes('.pdf') ? 'pdf' : 'video',
      duration: lecture.lectureDuration
    }];
  };

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleLecture = (chapterId, lectureId) => {
    const lectureKey = `${chapterId}-${lectureId}`;
    const newExpanded = new Set(expandedLectures);
    
    if (newExpanded.has(lectureKey)) {
      newExpanded.delete(lectureKey);
    } else {
      newExpanded.add(lectureKey);
    }
    
    setExpandedLectures(newExpanded);
  };

  const handleLectureClick = (chapterId, lectureId, lecture) => {
    onLectureSelect && onLectureSelect({
      chapterId,
      lectureId,
      lecture,
      courseId
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return '0m';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes > 0) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('video/')) {
      return assets.play_icon;
    } else if (mimeType === 'application/pdf') {
      return assets.file_upload_icon;
    }
    return assets.lesson_icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading course structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading course structure: {error}</p>
      </div>
    );
  }

  if (!courseData || !courseData.courseContent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <img src={assets.lesson_icon} alt="No Content" className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h4 className="text-lg font-medium text-gray-700 mb-2">No Course Content</h4>
        <p className="text-gray-500 mb-4">This course doesn't have any content yet.</p>
        <div className="text-sm text-gray-400">
          <p>To add content:</p>
          <p>1. Drop your files into the course-materials folder</p>
          <p>2. Or use the file upload interface</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Course Content</h3>
        <p className="text-sm text-gray-600">
          {courseData.courseContent.length} chapter{courseData.courseContent.length !== 1 ? 's' : ''} • 
          {courseData.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0)} lecture{courseData.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {courseData.courseContent.map((chapter, chapterIndex) => (
          <div key={chapter.chapterId} className="bg-white">
            {/* Chapter Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleChapter(chapter.chapterId)}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={expandedChapters.has(chapter.chapterId) ? assets.down_arrow_icon : assets.arrow_icon} 
                  alt="Toggle" 
                  className="w-4 h-4 transition-transform"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Chapter {chapterIndex + 1}: {chapter.chapterTitle}
                  </h4>
                  <p className="text-sm text-gray-600">Learn {chapter.chapterTitle} concepts</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{chapter.chapterContent.length} lecture{chapter.chapterContent.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{formatDuration(chapter.chapterContent.reduce((total, lecture) => total + (lecture.lectureDuration || 0), 0))}</span>
              </div>
            </div>

            {/* Chapter Lectures */}
            {expandedChapters.has(chapter.chapterId) && (
              <div className="bg-gray-50 border-t">
                {chapter.chapterContent.map((lecture, lectureIndex) => (
                  <div key={lecture.lectureId} className="border-b border-gray-200 last:border-b-0">
                    {/* Lecture Header */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleLecture(chapter.chapterId, lecture.lectureId)}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={expandedLectures.has(`${chapter.chapterId}-${lecture.lectureId}`) ? assets.down_arrow_icon : assets.arrow_icon} 
                          alt="Toggle" 
                          className="w-4 h-4 transition-transform"
                        />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {lectureIndex + 1}. {lecture.lectureTitle}
                          </h5>
                          <p className="text-sm text-gray-600">Learn {lecture.lectureTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatDuration(lecture.lectureDuration)}</span>
                        {lecture.isPreviewFree && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            Preview
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lecture Media */}
                    {expandedLectures.has(`${chapter.chapterId}-${lecture.lectureId}`) && (
                      <div className="bg-white border-t border-gray-200 p-4">
                        <div className="space-y-2">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Course Materials:</h6>
                          <div className="space-y-1">
                            {lecture.lectureUrl && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                                <img 
                                  src={lecture.lectureUrl.includes('.pdf') ? assets.file_upload_icon : assets.play_icon} 
                                  alt={lecture.lectureUrl.includes('.pdf') ? 'PDF' : 'Video'} 
                                  className="w-4 h-4" 
                                />
                                <span className="text-gray-700">{lecture.lectureTitle}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">{lecture.lectureUrl.includes('.pdf') ? 'PDF' : 'Video'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Play Button */}
                        <button
                          onClick={() => handleLectureClick(chapter.chapterId, lecture.lectureId, lecture)}
                          className={`w-full mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedLecture?.lectureId === lecture.lectureId
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {selectedLecture?.lectureId === lecture.lectureId ? 'Currently Playing' : 'Start Lecture'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseStructure;

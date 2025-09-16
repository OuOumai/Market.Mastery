import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import Loading from '../../components/student/Loading';
import './CoursesList.css';
import { AppContext } from '../../context/AppContext';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const coursesData = await response.json();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseFolder) => {
    navigate(`/student/course/${courseFolder}`);
  };

  const handleEnroll = async (courseFolder) => {
    // For now, just navigate to course details
    // Later you can add enrollment logic here
    navigate(`/student/course/${courseFolder}`);
  };

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           course.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(courses.map(course => course.category).filter(Boolean))];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="courses-list">
        <div className="error-message">
          <h2>Error Loading Courses</h2>
          <p>{error}</p>
          <button onClick={fetchCourses} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-list">
      <div className="courses-header">
        <h1>Available Courses</h1>
        <p>Discover and enroll in courses to advance your learning</p>
      </div>

      {/* Search and Filter Section */}
      <div className="courses-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredCourses.length} of {courses.length} courses
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          {courses.length === 0 ? (
            <div className="empty-state">
              <h2>No Courses Available</h2>
              <p>There are currently no courses available. Check back later!</p>
            </div>
          ) : (
            <div className="no-results">
              <h2>No Courses Found</h2>
              <p>Try adjusting your search or filter criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.folderName}
              course={course}
              onClick={() => handleCourseClick(course.folderName)}
              onEnroll={() => handleEnroll(course.folderName)}
            />
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="courses-actions">
        <button onClick={fetchCourses} className="refresh-btn">
          Refresh Courses
        </button>
      </div>
    </div>
  );
};

export default CoursesList;
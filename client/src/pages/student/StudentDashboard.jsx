import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import Loading from '../../components/student/Loading';
import './StudentDashboard.css';
import { AppContext } from '../../context/AppContext';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCount: 0,
    completedCount: 0,
    inProgressCount: 0
  });
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all courses
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const coursesData = await response.json();
      
      // Process courses data
      setCourses(coursesData);
      
      // For now, we'll simulate enrolled courses
      // In a real app, you'd have user enrollment data
      const mockEnrolledCourses = coursesData.slice(0, Math.min(3, coursesData.length));
      setEnrolledCourses(mockEnrolledCourses);
      
      // Get recent courses (last 4)
      const recent = coursesData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);
      setRecentCourses(recent);
      
      // Calculate stats
      setStats({
        totalCourses: coursesData.length,
        enrolledCount: mockEnrolledCourses.length,
        completedCount: 0, // Mock data - implement based on your progress tracking
        inProgressCount: mockEnrolledCourses.length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseFolder) => {
    navigate(`/student/course/${courseFolder}`);
  };

  const handleViewAllCourses = () => {
    navigate('/student/courses');
  };

  const handleViewEnrollments = () => {
    navigate('/student/enrollments');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="error-message">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome Back!</h1>
          <p>Continue your learning journey with our courses</p>
        </div>
        
        <div className="quick-actions">
          <button onClick={handleViewAllCourses} className="action-btn primary">
            Browse All Courses
          </button>
          <button onClick={handleViewEnrollments} className="action-btn secondary">
            My Enrollments
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.totalCourses}</h3>
              <p>Available Courses</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.enrolledCount}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.inProgressCount}</h3>
              <p>In Progress</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats.completedCount}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <button onClick={handleViewEnrollments} className="view-all-btn">
              View All Enrollments →
            </button>
          </div>
          
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.folderName} className="enrolled-course-card">
                <CourseCard
                  course={course}
                  onClick={() => handleCourseClick(course.folderName)}
                  onEnroll={() => handleCourseClick(course.folderName)}
                />
                
                {/* Progress Bar */}
                <div className="course-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>0%</span> {/* Mock progress - implement based on your tracking */}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleCourseClick(course.folderName)}
                  className="continue-btn"
                >
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Courses Section */}
      {recentCourses.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Recently Added Courses</h2>
            <button onClick={handleViewAllCourses} className="view-all-btn">
              View All Courses →
            </button>
          </div>
          
          <div className="courses-grid">
            {recentCourses.map((course) => (
              <CourseCard
                key={course.folderName}
                course={course}
                onClick={() => handleCourseClick(course.folderName)}
                onEnroll={() => handleCourseClick(course.folderName)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No Courses Available</h2>
          <p>There are currently no courses available. Check back later for new content!</p>
          <button onClick={fetchDashboardData} className="refresh-btn">
            Refresh Dashboard
          </button>
        </div>
      )}

      {/* Learning Tips Section */}
      <div className="learning-tips">
        <h2>Learning Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h3>Set Learning Goals</h3>
            <p>Define clear objectives for each course to stay motivated and track progress.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h3>Consistent Schedule</h3>
            <p>Dedicate specific time slots for learning to build a sustainable routine.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h3>Take Notes</h3>
            <p>Write down key concepts and insights to reinforce your learning.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🤝</div>
            <h3>Practice Regularly</h3>
            <p>Apply what you learn through exercises and real-world projects.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="dashboard-footer">
        <div className="footer-actions">
          <button onClick={fetchDashboardData} className="refresh-dashboard-btn">
            🔄 Refresh Dashboard
          </button>
          <button onClick={handleViewAllCourses} className="explore-courses-btn">
            🔍 Explore All Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
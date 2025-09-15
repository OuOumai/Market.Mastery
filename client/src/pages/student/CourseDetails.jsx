import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import CourseCard from '../../components/student/CourseCard'
import Footer from '../../components/student/Footer'
import CourseStructure from '../../components/student/CourseStructure'
import VideoPlayer from '../../components/student/VideoPlayer'
import PDFViewer from '../../components/student/PDFViewer'
import { assets, dummyTestimonial, dummyEducatorData } from '../../assets/assets'

const CourseDetails = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [selectedLecture, setSelectedLecture] = useState(null)
  const [currentMedia, setCurrentMedia] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const { courses, getLectureUrl } = useContext(AppContext)

  const fetchCourseData = async () => {
    const found = courses.find(course => course.id === id)
    if (found) {
      setCourseData(found)
      console.log('Found course:', found)
    } else {
      console.log('Course not found for id:', id)
      console.log('Available courses:', courses.map(c => ({ id: c.id, name: c.name })))
    }
  }

  // Handle lecture selection
  const handleLectureSelect = (lectureData) => {
    setSelectedLecture(lectureData)
    const url = getLectureUrl(lectureData)
    if (!url) {
      setCurrentMedia(null)
      setShowVideoPlayer(false)
      setShowPDFViewer(false)
      return
    }
    // Minimal handling based on lecture type
    if (lectureData.type === 'video') {
      setCurrentMedia([{ mimeType: 'video/mp4', url }])
      setShowVideoPlayer(true)
      setShowPDFViewer(false)
    } else if (lectureData.type === 'pdf') {
      setCurrentMedia([{ mimeType: 'application/pdf', url }])
      setShowVideoPlayer(false)
      setShowPDFViewer(true)
    } else {
      setCurrentMedia(null)
      setShowVideoPlayer(false)
      setShowPDFViewer(false)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [courses, id])

  const getLevelFromTitle = (title = '') => {
    if(title.toLowerCase().includes('advanced')) return 'Advanced'
    if(title.toLowerCase().includes('introduction') || title.toLowerCase().includes('basics')) return 'Beginner'
    return 'Intermediate'
  }

  const getCategoryFromTitle = (title = '') => {
    const lower = title.toLowerCase()
    if(lower.includes('marketing')) return 'Marketing'
    if(lower.includes('javascript') || lower.includes('web')) return 'Web Development'
    if(lower.includes('python') || lower.includes('data')) return 'Data Science'
    if(lower.includes('cyber')) return 'Cybersecurity'
    if(lower.includes('cloud')) return 'Cloud Computing'
    return 'General'
  }

  const computeTotals = (content = []) => {
    let lectures = 0
    let totalMinutes = 0
    let chapters = content.length
    content.forEach(chapter => {
      if (chapter.lectures) {
        chapter.lectures.forEach(lecture => {
          lectures += 1
          // Default duration for videos (5 minutes) and PDFs (10 minutes)
          const duration = lecture.type === 'video' ? 5 : lecture.type === 'pdf' ? 10 : 5
          totalMinutes += duration
        })
      }
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return { lectures, chapters, hours, minutes, totalMinutes }
  }

  const discountedPrice = useMemo(() => {
    if(!courseData) return 0
    const { coursePrice = 0, discount = 0 } = courseData
    return (coursePrice - (discount * coursePrice) / 100).toFixed(2)
  }, [courseData])

  const countdown = useMemo(() => {
    if(!courseData) return { days: 5, hours: 0 }
    const base = new Date(courseData.updatedAt || courseData.createdAt || Date.now())
    const ends = new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = Math.max(0, ends.getTime() - now.getTime())
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    return { days, hours }
  }, [courseData])

  const ratingInfo = useMemo(() => ({ value: courseData?.rating || 4.5, count: 0 }), [courseData])
  
  // Currency symbol
  const currency = '$'

  const totalsInfo = useMemo(() => computeTotals(courseData?.chapters || []), [courseData])

  const estimatedTimeLabel = useMemo(() => {
    if(!courseData) return ''
    const h = totalsInfo.hours
    const m = totalsInfo.minutes
    if(h <= 0) return `${m}m`
    if(m === 0) return `${h}h`
    return `${h}h ${m}m`
  }, [courseData, totalsInfo])

  const instructor = useMemo(() => {
    if(!courseData) return null
    if(courseData.educator === dummyEducatorData._id) {
      return {
        name: dummyEducatorData.name,
        title: 'Senior Growth Strategist (10+ years experience)',
        imageUrl: dummyEducatorData.imageUrl,
        bio: 'Marketing leader with a decade of experience helping startups and enterprises scale with data-driven customer acquisition and retention. Specialized in funnels, SEO, and paid growth.'
      }
    }
    return {
      name: 'Expert Instructor',
      title: 'Senior Growth Strategist',
      imageUrl: assets.profile_img,
      bio: 'Experienced marketer with a track record of driving revenue growth using full-funnel strategy, performance ads, and conversion optimization.'
    }
  }, [courseData])

  const certificateName = useMemo(() => {
    if(!courseData) return ''
    const category = getCategoryFromTitle(courseData.name)
    if(category === 'Marketing') return 'Diploma in Digital Marketing Mastery'
    if(getLevelFromTitle(courseData.name) === 'Advanced') return 'Advanced Certificate in Business Growth'
    return `${getLevelFromTitle(courseData.name)} Certificate`
  }, [courseData])

  const relatedCourses = useMemo(() => {
    if(!courseData) return []
    const currentCategory = getCategoryFromTitle(courseData.name)
    const sameCategory = (courses || []).filter(c => c.id !== courseData.id && getCategoryFromTitle(c.name) === currentCategory)
    if(sameCategory.length > 0) return sameCategory.slice(0, 4)
    return (courses || []).filter(c => c.id !== courseData.id).slice(0, 4)
  }, [courses, courseData])

  // Star rating component
  const StarRating = ({ rating, size = 'text-lg' }) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className={`flex items-center gap-1 ${size}`}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">☆</span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return courseData ? (
    <>
      {/* Main Header */}
      <div className='relative md:px-36 px-8 pt-20'>
        {/* Breadcrumb */}
        <p className='text-sm text-gray-500 mb-6'>
          <span className='text-blue-600 cursor-pointer' onClick={()=>navigate('/')}>Home</span> / <span>Course</span>
        </p>

        {/* Main Content Layout */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Main Section - Course Info */}
          <div className='flex-1'>
            {/* Course Title */}
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-6'>{courseData.name}</h1>
            
            {/* Course Introduction/Description */}
            <div className='mb-8'>
              <h2 className='text-lg font-semibold text-gray-800 mb-3'>About This Course</h2>
              <div className='prose max-w-none text-gray-700 leading-relaxed'>
                {courseData.description || 'No description available.'}
              </div>
            </div>

            {/* What You'll Learn */}
            <div className='mb-8'>
              <h2 className='text-lg font-semibold text-gray-800 mb-3'>What You'll Learn</h2>
              <ul className='grid sm:grid-cols-2 gap-3 text-sm text-gray-700'>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>Build a customer acquisition funnel</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>SEO & ads strategies to grow your business</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>Real-world marketing case studies</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>Hands-on project guidance</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>Certification of completion</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-500 mt-1'>✓</span>
                  <span>Access to growth strategy toolkits</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Course Card - Side Panel */}
          <div className='lg:w-80 w-full'>
            <div className='bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden sticky top-24'>
              {/* Course Image */}
              <div className='w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
                <div className='text-center text-white'>
                  <div className='text-4xl mb-2'>📚</div>
                  <p className='font-medium'>{courseData.name}</p>
                </div>
              </div>
              
              {/* Card Content */}
              <div className='p-4'>
                {/* Pricing */}
                <div className='mb-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-2xl font-bold text-blue-600'>{currency}49.99</span>
                    <span className='text-lg text-gray-500 line-through'>{currency}99.99</span>
                    <span className='text-xs bg-red-100 text-red-600 px-2 py-1 rounded'>50% OFF</span>
                  </div>
                  <div className='text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded'>
                    Limited-time offer: Only {countdown.days} day{countdown.days !== 1 ? 's' : ''} {countdown.hours > 0 ? `and ${countdown.hours} hour${countdown.hours !== 1 ? 's' : ''}`: ''} left!
                  </div>
                </div>

                {/* Rating */}
                <div className='mb-4'>
                  <StarRating rating={ratingInfo.value} size='text-sm' />
                  <p className='text-xs text-gray-600 mt-1'>
                    Based on {ratingInfo.count} student review{ratingInfo.count !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Meta Info */}
                <div className='space-y-2 mb-4 text-xs'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Duration:</span>
                    <span className='font-medium'>{estimatedTimeLabel}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Level:</span>
                    <span className='font-medium'>{getLevelFromTitle(courseData.name)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Students:</span>
                    <span className='font-medium'>—</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Lectures:</span>
                    <span className='font-medium'>{totalsInfo.lectures}</span>
                  </div>
                </div>

                {/* Author Details */}
                {instructor && (
                  <div className='mb-4'>
                    <h3 className='text-xs font-semibold text-gray-800 mb-2'>Instructor</h3>
                    <div className='flex items-center gap-2'>
                      <img src={instructor.imageUrl} alt={instructor.name} className='w-8 h-8 rounded-full object-cover'/>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{instructor.name}</div>
                        <div className='text-xs text-gray-600'>{instructor.title}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Who This Course Is For */}
                <div className='mb-4'>
                  <h3 className='text-xs font-semibold text-gray-800 mb-2'>Who This Course Is For</h3>
                  <ul className='text-xs text-gray-700 space-y-1'>
                    <li>• Marketing beginners</li>
                    <li>• Business owners wanting to scale</li>
                    <li>• Students preparing for digital marketing careers</li>
                    <li>• Professionals upgrading skills</li>
                  </ul>
                </div>

                {/* Enroll Button */}
                <button 
                  onClick={()=>navigate(`/player/${courseData.id}`)} 
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm'
                >
                  Enroll Now
                </button>

                {/* Security Badges */}
                <div className='mt-3 flex items-center justify-center gap-2 text-xs text-gray-500'>
                  <span>30-day money-back guarantee</span>
                  <span>•</span>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Detailed Instructor Profile */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-6'>Meet Your Instructor</h2>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <div className='flex items-start gap-6'>
            <img src={instructor?.imageUrl} alt={instructor?.name} className='w-20 h-20 rounded-full object-cover'/>
            <div className='flex-1'>
              <div className='font-bold text-lg text-gray-900 mb-1'>{instructor?.name}</div>
              <div className='text-blue-600 font-medium mb-3'>{instructor?.title}</div>
              <p className='text-gray-700 leading-relaxed'>{instructor?.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category & Certification */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>Category & Certification</h2>
        <div className='grid sm:grid-cols-2 gap-4 text-sm'>
          <div className='border rounded'>
            <div className='px-3 py-2 bg-gray-50 border-b font-medium'>Course Category</div>
            <div className='px-3 py-3'>{getCategoryFromTitle(courseData.name)}</div>
          </div>
          <div className='border rounded'>
            <div className='px-3 py-2 bg-gray-50 border-b font-medium'>Certification</div>
            <div className='px-3 py-3'>{certificateName}</div>
          </div>
        </div>
      </div>

      {/* Course Structure Overview (table) */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>Course Structure Overview</h2>
        <div className='overflow-x-auto border rounded'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr className='text-left'>
                <th className='px-4 py-2 border-b'>Sessions</th>
                <th className='px-4 py-2 border-b'>Chapters</th>
                <th className='px-4 py-2 border-b'>Total Hours</th>
                <th className='px-4 py-2 border-b'>Duration</th>
                <th className='px-4 py-2 border-b'>Learning Format</th>
                <th className='px-4 py-2 border-b'>Project Introduction</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const totals = computeTotals(courseData.chapters || [])
                return (
                  <tr>
                    <td className='px-4 py-3 border-b'>{totals.lectures}</td>
                    <td className='px-4 py-3 border-b'>{totals.chapters}</td>
                    <td className='px-4 py-3 border-b'>{totals.hours + (totals.minutes > 0 ? 1 : 0)}</td>
                    <td className='px-4 py-3 border-b'>{totals.hours}h {totals.minutes}m</td>
                    <td className='px-4 py-3 border-b'>Videos, PDFs, Interactive exercises</td>
                    <td className='px-4 py-3 border-b'>Build a capstone around "{courseData.name}" with real-world deliverables</td>
                  </tr>
                )
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Structure */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-6'>Course Structure</h2>
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Course Structure Panel */}
          <div className='lg:col-span-1'>
            {/* Course Structure - compatible with backend data format */}
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <h3 className='text-md font-semibold text-gray-800 mb-3'>Course Content</h3>
              <div className='space-y-3'>
                {(courseData.chapters || []).map((chapter, cIdx) => (
                  <div key={cIdx} className='border rounded'>
                    <div className='px-3 py-2 bg-gray-50 border-b font-medium'>
                      {chapter.name || `Chapter ${cIdx+1}`}
                    </div>
                    <div className='p-3 space-y-2'>
                      {chapter.lectures && chapter.lectures.length > 0 ? (
                        chapter.lectures.map((lecture, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => handleLectureSelect(lecture)}
                            className='w-full text-left px-3 py-2 rounded hover:bg-gray-50 border transition-colors'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                {lecture.type === 'video' && (
                                  <svg className='w-4 h-4 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                                  </svg>
                                )}
                                {lecture.type === 'pdf' && (
                                  <svg className='w-4 h-4 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z' clipRule='evenodd' />
                                  </svg>
                                )}
                                <span className='text-sm text-gray-800'>{lecture.name}</span>
                              </div>
                              <span className='text-xs text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded'>
                                {lecture.type}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className='text-sm text-gray-500 italic px-3 py-2'>
                          No lectures available in this chapter
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!courseData.chapters || courseData.chapters.length === 0) && (
                  <div className='text-center py-8 text-gray-500'>
                    <p>No course content available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media Player Panel */}
          <div className='lg:col-span-2'>
            {selectedLecture ? (
              <div className='space-y-4'>
                {/* Lecture Info */}
                <div className='bg-white border border-gray-200 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    {selectedLecture.name || 'Selected Lecture'}
                  </h3>
                  <p className='text-gray-600 mb-3'>
                    {selectedLecture.description || 'Click to view this lecture content.'}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span>Type: {selectedLecture.type}</span>
                    <span>•</span>
                    <span>File: {selectedLecture.name}</span>
                    {selectedLecture.url && (
                      <>
                        <span>•</span>
                        <span className='text-green-600 font-medium'>Available</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Video Player */}
                {showVideoPlayer && currentMedia && (
                  <VideoPlayer
                    videoUrl={currentMedia[0]?.url}
                    title={selectedLecture?.name}
                    description={selectedLecture?.description}
                    isPreview={false}
                    className="w-full"
                  />
                )}

                {/* PDF Viewer */}
                {showPDFViewer && currentMedia && (
                  <PDFViewer
                    pdfUrl={currentMedia[0]?.url}
                    title={selectedLecture?.name}
                    description={selectedLecture?.description}
                    isPreview={false}
                    className="w-full"
                  />
                )}

                {/* Media List */}
                {currentMedia && currentMedia.length > 0 && (
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                    <h4 className='text-md font-semibold text-gray-800 mb-3'>Course Materials</h4>
                    <div className='space-y-2'>
                      {currentMedia.map((media, index) => (
                        <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <img 
                              src={media.mimeType.startsWith('video/') ? assets.play_icon : assets.file_upload_icon} 
                              alt="Media" 
                              className='w-5 h-5' 
                            />
                            <div>
                              <p className='text-sm font-medium text-gray-800'>{media.title}</p>
                              <p className='text-xs text-gray-500'>{media.mimeType}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (media.mimeType.startsWith('video/')) {
                                setShowVideoPlayer(true);
                                setShowPDFViewer(false);
                              } else if (media.mimeType === 'application/pdf') {
                                setShowVideoPlayer(false);
                                setShowPDFViewer(true);
                              }
                            }}
                            className='px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
                          >
                            {media.mimeType.startsWith('video/') ? 'Play' : 'View'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Media Message */}
                {(!currentMedia || currentMedia.length === 0) && (
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
                    <img src={assets.lesson_icon} alt="No Media" className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <h4 className='text-lg font-medium text-gray-700 mb-2'>No Media Available</h4>
                    <p className='text-gray-500'>This lecture doesn't have any media files yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
                <img src={assets.lesson_icon} alt="Select Lecture" className='w-16 h-16 mx-auto mb-4 opacity-50' />
                <h4 className='text-lg font-medium text-gray-700 mb-2'>Select a Lecture</h4>
                <p className='text-gray-500'>Choose a lecture from the course structure to view its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>Course Description</h2>
        <div className='prose max-w-none text-gray-700'>
          {courseData.description || 'No description available.'}
        </div>
      </div>

      {/* Social Proof & Reviews */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>Student Reviews</h2>
        <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {dummyTestimonial.map((t, i) => (
            <div key={i} className='border rounded p-4 text-left'>
              <div className='flex items-center gap-3'>
                <img src={t.image} alt={t.name} className='w-10 h-10 rounded-full'/>
                <div>
                  <div className='font-semibold text-sm text-gray-900'>{t.name}</div>
                  <div className='text-xs text-gray-500'>{t.role}</div>
                </div>
              </div>
              <div className='mt-2 text-xs text-yellow-600'>
                {'★★★★★'.slice(0, Math.round(t.rating))}
              </div>
              <p className='mt-2 text-sm text-gray-700'>{t.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Courses */}
      <div className='md:px-36 px-8 mt-10'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>Related Courses</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {relatedCourses.map((c, idx) => (
            <CourseCard key={idx} course={c} />
          ))}
        </div>
      </div>

      {/* Footer - same as Home page */}
      <div className='mt-12'>
        <Footer />
      </div>

      {/* Sticky CTA */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:px-36 px-6 py-4 flex items-center justify-between z-20'>
        <div className='text-gray-700'>
          <span className='text-base'>Enroll in</span> <span className='font-semibold'>{courseData.name}</span>
        </div>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl font-bold text-blue-600'>{currency}49.99</span>
            <span className='text-gray-500 line-through text-lg'>{currency}99.99</span>
            <span className='text-sm bg-red-100 text-red-600 px-2 py-1 rounded'>50% OFF</span>
          </div>
          <div className='hidden md:flex items-center gap-4 text-xs text-gray-500'>
            <span>30-day money-back guarantee</span>
            <span className='h-3 w-px bg-gray-300'></span>
            <span>Secure checkout</span>
          </div>
          <button 
            onClick={()=>navigate(`/player/${courseData.id}`)} 
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
          >
            Enroll Now
          </button>
        </div>
      </div>
    </>
  ): <Loading />
}

export default CourseDetails
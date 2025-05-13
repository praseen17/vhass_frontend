import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { course, fetchCourse } = CourseData();
  const { isAuth, user } = UserData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  const checkoutHandler = async () => {
    if (!isAuth) {
      toast.error("Please login to purchase the course");
      navigate("/login", { state: { from: `/course/${params.id}` } });
      return;
    }

    setLoading(true);
    try {
      const { data: { order } } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      );

      const options = {
        key: "rzp_test_yOMeMyaj2wlvTt",
        amount: order.amount,
        currency: "INR",
        name: course.title,
        description: "Course Enrollment",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${server}/api/verification/${params.id}`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { token: localStorage.getItem("token") } }
            );
            toast.success("Payment successful!");
            navigate(`/payment-success/${response.razorpay_payment_id}`);
          } catch (error) {
            toast.error("Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#8a4baf" }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!course) return <div className="error-message">Course not found</div>;

  return (
    <div className="course-description">
      <div className="course-header">
        <h1>{course.title}</h1>
        <img src={`${server}/${course.image}`} alt={course.title} />
      </div>

      <div className="course-meta">
        <span>Instructor: {course.createdBy}</span>
        <span>Duration: {course.duration} hours</span>
        <span>Price: ₹{course.price}</span>
      </div>

      <div className="course-content">
        <h2>About This Course</h2>
        <p>{course.description}</p>

        {course.syllabus && course.syllabus.length > 0 && (
          <div className="syllabus-section">
            <h2>Course Syllabus</h2>
            <ul>
              {course.syllabus.map((mod, idx) => (
                <li key={idx}>{mod}</li>
              ))}
            </ul>
          </div>
        )}

        {course.whoShouldAttend && course.whoShouldAttend.length > 0 && (
          <div className="who-should-attend-section">
            <h2>Who Should Attend</h2>
            <ul>
              {course.whoShouldAttend.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="prerequisites-section">
            <h2>Prerequisites</h2>
            <ul>
              {course.prerequisites.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        
      </div>

      <div className="action-buttons">
        {isAuth && user?.subscription?.includes(course._id) ? (
          <button 
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="study-btn"
          >
            Continue Learning
          </button>
        ) : (
          <button 
            onClick={checkoutHandler} 
            className="enroll-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : isAuth ? "Enroll Now" : "Login to Enroll"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDescription;
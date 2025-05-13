import React, { useState } from "react";
import Layout from "../Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const categories = [
  "Cyber Security",
  "EntrepreneurShip",
];

const AdminCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") return navigate("/");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [syllabus, setSyllabus] = useState([""]);
  const [whoShouldAttend, setWhoShouldAttend] = useState([""]);
  const [prerequisites, setPrerequisites] = useState([""]);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const { courses, fetchCourses } = CourseData();

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("createdBy", createdBy);
    myForm.append("duration", duration);
    myForm.append("file", image);
    syllabus.forEach((item) => myForm.append("syllabus", item));
    whoShouldAttend.forEach((item) => myForm.append("whoShouldAttend", item));
    prerequisites.forEach((item) => myForm.append("prerequisites", item));

    try {
      console.log('Form data:', Object.fromEntries(myForm));
      console.log('Server URL:', `${server}/api/admin/course/new`);
      
      console.log('FULL REQUEST DEBUGGING:', {
        url: `${server}/api/admin/course/new`,
        formData: Object.fromEntries(myForm),
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { data } = await axios.post(`${server}/api/admin/course/new`, myForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add additional headers for debugging
          'X-Debug-Request': 'true'
        },
        withCredentials: true,
        // Add timeout for debugging
        timeout: 10000
      });

      console.log('Course creation response:', data);
      
      toast.success(data.message);
      setBtnLoading(false);
      await fetchCourses();
      setImage("");
      setTitle("");
      setDescription("");
      setDuration("");
      setImagePrev("");
      setCreatedBy("");
      setPrice("");
      setCategory("");
      setSyllabus([""]);
      setWhoShouldAttend([""]);
      setPrerequisites([""]);
    } catch (error) {
      console.error('Course creation error:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      toast.error(error.response?.data?.message || 'Failed to create course');
      setBtnLoading(false);
    }
  };

  return (
    <Layout>
      <div className="admin-courses">
        <div className="left">
          <h1>All Courses</h1>
          <div className="dashboard-content">
            {courses && courses.length > 0 ? (
              courses.map((e) => {
                return <CourseCard key={e._id} course={e} />;
              })
            ) : (
              <p>No Courses Yet</p>
            )}
          </div>
        </div>

        <div className="right">
          <div className="add-course">
            <div className="course-form">
              <h2>Add Course</h2>
              <form onSubmit={submitHandler}>
                <label htmlFor="text">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <label htmlFor="text">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <label htmlFor="text">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <label htmlFor="text">createdBy</label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  required
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value={""}>Select Category</option>
                  {categories.map((e) => (
                    <option value={e} key={e}>
                      {e}
                    </option>
                  ))}
                </select>

                <label htmlFor="text">Duration</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />

                <input type="file" required onChange={changeImageHandler} />
                {imagePrev && <img src={imagePrev} alt="" width={300} />}

                <label>Syllabus / Modules</label>
                {syllabus.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newSyllabus = [...syllabus];
                        newSyllabus[idx] = e.target.value;
                        setSyllabus(newSyllabus);
                      }}
                      required
                    />
                    <button type="button" onClick={() => setSyllabus(syllabus.filter((_, i) => i !== idx))} disabled={syllabus.length === 1}>-</button>
                    <button type="button" onClick={() => setSyllabus([...syllabus, ""])}>+</button>
                  </div>
                ))}

                <label>Who Should Attend</label>
                {whoShouldAttend.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newList = [...whoShouldAttend];
                        newList[idx] = e.target.value;
                        setWhoShouldAttend(newList);
                      }}
                      required
                    />
                    <button type="button" onClick={() => setWhoShouldAttend(whoShouldAttend.filter((_, i) => i !== idx))} disabled={whoShouldAttend.length === 1}>-</button>
                    <button type="button" onClick={() => setWhoShouldAttend([...whoShouldAttend, ""])}>+</button>
                  </div>
                ))}

                <label>Prerequisites</label>
                {prerequisites.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newList = [...prerequisites];
                        newList[idx] = e.target.value;
                        setPrerequisites(newList);
                      }}
                      required
                    />
                    <button type="button" onClick={() => setPrerequisites(prerequisites.filter((_, i) => i !== idx))} disabled={prerequisites.length === 1}>-</button>
                    <button type="button" onClick={() => setPrerequisites([...prerequisites, ""])}>+</button>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={btnLoading}
                  className="common-btn"
                >
                  {btnLoading ? "Please Wait..." : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCourses;

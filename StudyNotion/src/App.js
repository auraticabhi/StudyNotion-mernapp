import "./App.css";
import Home from "./pages/Home"
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Error from "./pages/Error"
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import { useSelector } from "react-redux";
import { ACCOUNT_TYPE } from "./utils/constants";
import MyProfile from "./components/core/Dashboard/MyProfile";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Contact from "./pages/Contact";
import Cart from "./components/core/Dashboard/Cart/index";
import AddCourse from "./components/core/Dashboard/AddCourse/index";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails"
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails"
import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";
import Settings from "./components/core/Dashboard/Settings";
import Cat from "./pages/Cat";

function App() {

    const { user } = useSelector((state) => state.profile)

    return ( 
        <div className = "w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
        <Navbar/>
        <Routes>
           <Route path = "/" element = { < Home / > }/> 
           <Route path = "catalog/:catalogName" element = { < Catalog / > }/>
           <Route path = "cat" element = { < Cat / > }/>
           <Route path = "courses/:courseId" element = { < CourseDetails / > }/> 
           <Route path = "signup" element = { 
            <OpenRoute>
            <Signup/>
            </OpenRoute>
            }/> 
           <Route path = "login"
            element = { <OpenRoute>
            <Login/>
            </OpenRoute>
        }/>

           <Route path = "forgot-password"
            element = { <ForgotPassword/>}
           />  

           <Route path = "verify-email"
            element = { <VerifyEmail/>}
           />  

           <Route path = "update-password/:id"
            element = { <UpdatePassword/>}
           />

           <Route path = "/contact" element = { < Contact/> }
           />

           <Route path = "about" element = { <About/>}
           /> 

           <Route element = { 
            <PrivateRoute>
            <Dashboard/>
            </PrivateRoute>}>

           <Route path = "dashboard/my-profile" element = { < MyProfile/> }
           /> 
           <Route path = "dashboard/Settings" element = { < Settings / > }/>

        {
            user !== null &&
                user.accountType === ACCOUNT_TYPE.STUDENT && ( 
                    <>
                    <Route path = "dashboard/cart" element = {<Cart/>}/> 
                    <Route path = "dashboard/enrolled-courses"
                    element = { < EnrolledCourses / > }
                    /> 
                    </>
                )
        } {
            user !== null && user.accountType === ACCOUNT_TYPE.INSTRUCTOR && ( 
                <>
                <Route path = "dashboard/instructor" element = { < Instructor / > }/> 
                <Route path = "dashboard/add-course" element = { < AddCourse / > }/> 
                <Route path = "dashboard/my-courses" element = { < MyCourses / > }/> 
                <Route path = "dashboard/edit-course/:courseId" element = { < EditCourse / > }/> 
                </>
            )
        } 
        </Route>


        <Route element = { 
            <PrivateRoute >
            <ViewCourse/>
            </PrivateRoute>
        } >

        {
            user !== null && user.accountType === ACCOUNT_TYPE.STUDENT && ( 
                <>
                <Route path = "view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element = { < VideoDetails / > }
                /> 
                </>
            )
        }

        </Route>

        <Route path = "*"
        element = { < Error / > }
        />

        </Routes>

        </div>
    );
}

export default App;
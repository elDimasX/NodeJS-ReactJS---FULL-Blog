
import ReactDOM from 'react-dom/client';
import './index.css';
import "./Css/Global.css";

import RoutesFront from "./Routes";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from './Contexts/AuthContext';

import ScrollToTop from "./Components/ScrollToTop";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  
  <BrowserRouter>
    <ScrollToTop/>
    <ToastContainer 

      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: "#0F1115",
        color: "#fff"
      }}
    
    />
    <AuthProvider>
    <Header></Header>
    
    <div className="allMAIN">
      <RoutesFront/>
    </div>
    <Footer></Footer>
    </AuthProvider>
  </BrowserRouter>

);


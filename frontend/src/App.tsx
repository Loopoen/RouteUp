import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/pages/Home"
import Login from "./components/pages/Login"
import {Toaster} from "react-hot-toast"




function App() {
 

  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>} />


          </Routes>

          <Toaster/>
      </BrowserRouter>
    </>
  )
}

export default App

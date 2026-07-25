import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import {Toaster} from "react-hot-toast"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"

import SelectRole from "./pages/SelectRole"
import Navbar from "./components/Navbar"
import Account from "./pages/Account"
import { useAppData } from "./context/AppContext"
import Restaurant from "./pages/Restaurant"
import path from 'path';
import RestaurantPage from "./pages/RestaurantPage"
import CartPage from "./pages/CartPage"
import Address from "./pages/Address"
import AddAddressPage from "./pages/Address"
import CheckOut from "./pages/CheckOut"
import PaymentSuccess from "./pages/PaymentSuccess"
import OrderSuccess from "./pages/OrderSuccess"
import Order from "./pages/Order"
import RiderDashBoard from "./pages/RiderDashBoard"

function App() {
 
  const {user} = useAppData()

  if(user && user.role === "seller"){
      return <Restaurant/>
  } 

   if(user && user.role === "rider"){
      return <RiderDashBoard/>
  } 
  return (
    <>
      <BrowserRouter>
       <Toaster position="bottom-right" />
       <Navbar/>
          <Routes>
            <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login/>} />
            </Route>


                 <Route path="/ordersuccess" element={<OrderSuccess/>} /> 
            <Route element={<ProtectedRoute/>}>
                     <Route path="/" element={<Home/>}/>
                     <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess/>} />
                
                   
                     <Route path="/select-role" element={<SelectRole/>}/>
                     <Route path="/account" element={<Account/>} />
                     <Route path="/restaurant/:id" element={<RestaurantPage/>}  />
                     <Route path="/cart" element={<CartPage/>}/>
                     <Route path="/addresses" element={<AddAddressPage/>} />
                     <Route path="/checkout" element={<CheckOut/>}/>
                     <Route path="/orders" element={<Order/>} />
            </Route>
     
          


          </Routes>

          
      </BrowserRouter>
    </>
  )
}

export default App

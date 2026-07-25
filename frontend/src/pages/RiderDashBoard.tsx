import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";



export interface IRider   {
  userId: string;
  picture: string;
  phoneNumber: string;
  cccdNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  isAvailable: boolean;

}


const RiderDashBoard = () => {

    const {user} = useAppData()

    const {socket} = useSocket()

    const [profile, setProfile] = useState<IRider| null> (null)

    const [loading, setLoading] = useState(true)

    const [toggling, setToggling] = useState(false)

    const fetchMyProfile = ()=>{
        
    }
  return (
    <div>
      <h2>RiderDashBoard</h2>
    </div>
  );
};

export default (RiderDashBoard);
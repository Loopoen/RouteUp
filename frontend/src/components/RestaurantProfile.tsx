import { useState } from "react";
import type { IRestaurant } from "../type";




interface props{
    restaurant:IRestaurant;
    isSeller:boolean
}

const RestaurantProfile = ({restaurant, isSeller}:props) => {

    const [editmode, setEditMode] = useState(false)
    const [name, setName] = useState(restaurant.name)
    const [description, setDescription] = useState(restaurant.description)
    const [isOpen, setIsOpen] = useState(restaurant.isOpen)
    const [loading ,setLoading] = useState(false)
  return (
    <div>
      <h2>RestaurantProfile</h2>
    </div>
  );
};

export default (RestaurantProfile);
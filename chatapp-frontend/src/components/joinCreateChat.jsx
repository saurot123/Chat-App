import React, { useState } from 'react'
import chatIcon from "../assets/chat.png"
import toast from 'react-hot-toast';
import { createChatRoom, joinChatRoom } from '../services/RoomService';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
const JoinCreateChat = () => {
  const [detail,setDetail] = useState({
    roomId:'',
    userName:''
  });

  const {roomId, currentUser,connected, setRoomId, setCurrentUser,setConnected} = useChatContext();

  const navigate = useNavigate();
  function handleFormInputChange(event)
  {
    setDetail({
      ...detail,
      [event.target.name]:event.target.value,
    });
  }

  async function joinChat()
  {
    if(validateForm())
    {
      //join chat
      try
      {
        const response = await joinChatRoom(detail.roomId);
        toast.success('joined...');
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate('/chat')
      }
      catch(error)
      {
        if(error.status == 400)
        {
          toast.error('Room not found!!');
        }
        else
        {
          toast.error('something went wrong!!')
        }
        console.log(error);
      }

    }
  }
  async function createRoom()
  {
    if(validateForm())
    {
        //create chat
      console.log(detail);
      //call api to create room on server
      try
      {
        const response = await createChatRoom(detail.roomId);
        console.log(response);
        toast.success("Room created Successfully!!");
        //join room
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        //forward to chatpage
        navigate('/chat')
      }
      catch(error)
      {
        if(error.status==400)
        {
          console.log(error);
          toast.error("Room Already Exist!!")
        }
        else
        {
          console.log(error);
          toast.error("Error in creating room")
        }
      } 
    }

  }
  function validateForm()
  {
    if(detail.roomId =='' || detail.userName=='')
    {
      toast.error('invalid input');
      return false;
    }
    return true;
  }
  return (
    <div className="min-h-screen flex items-center justify-center"
    >
        <div className='p-10 dark:border-gray-700 border flex flex-col gap-4 w-full max-w-md rounded dark:bg-gray-900 shadow'>
            <div>
              <img src={chatIcon} alt="" className='w-24 mx-auto'/>
            </div>
            <h1 className='text-2xl front-semibold text-center'
            >Join Room / Create Room</h1>
            {/** Name div */}
        <div className="">
            <label htmlFor="name" className="block font-medium mb-2">Your Name: </label>
            <input type="text"
            onChange={handleFormInputChange}
            value = {detail.userName}
            name='userName'
            placeholder='Enter your name'
            id="name"
            className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            ></input>
        </div>
        {/** Room div*/}
        <div className="">
            <label htmlFor="name" className="block font-medium mb-2">Room ID / New Room ID </label>
            <input type="text"
            id="roomId"
            name='roomId'
            onChange={handleFormInputChange}
            value={detail.roomId}
            placeholder='Enter Room ID'
            className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            ></input>
        </div>
        {/** button */}
        <div className='flex justify-center gap-4 mt-2'>
          <button onClick={joinChat} className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded">Join Room</button>
          <button onClick={createRoom} className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded">Create Room</button>
        </div>
        </div>
    </div>
  );
};

export default JoinCreateChat;
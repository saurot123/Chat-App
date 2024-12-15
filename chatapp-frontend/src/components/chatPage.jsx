import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";
const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();
  //console.log(roomId);
  //console.log(currentUser);
  // console.log(connected);
  const navigate = useNavigate();
  useEffect(() => {
    if (connected == false) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  //const [roomId, setRoomId] = useState("");
  //const [currentUser] = useState("saurabh")
  //page init
  //load message

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);
        console.log(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);
  //stomp client init
  //subscriber
  useEffect(() => {
    const connectWebSocket = () => {
      //sock js object
      const socket = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(socket);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("connected");
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };
    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  //send message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };
      console.log("message", message);
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  const handlelogout = () => {
    stompClient.disconnect();
    setConnected(false);
    navigate("/");
    setRoomId("");
    setCurrentUser("");
  };
  return (
    <div className="">
      {/**Header Portion */}
      <header className="dark:border-gray-700 fixed h-20 w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center">
        {/** room name container */}
        <div>
          <h1 className="text-xl font-semibold">
            Room : <span>{roomId}</span>
          </h1>
        </div>
        {/**username container */}
        <div>
          <h1 className="text-xl font-semibold">
            User: <span>{currentUser}</span>
          </h1>
        </div>
        {/**leave room button container */}
        <div>
          <button
            onClick={handlelogout}
            className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-lg"
          >
            Leave Room
          </button>
        </div>
      </header>

      <main
        ref={chatBoxRef}
        className="py-20 px-10 border w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender == currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`my-2 ${
                message.sender == currentUser ? "bg-blue-600" : "bg-green-600"
              } py-2 px-2 max-w-xs rounded`}
            >
              <div className="flex flex-row gap-2">
                <img
                  className="h-10 w-10"
                  src={"https://avatar.iran.liara.run/public/41"}
                  alt=""
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">{message.sender}</p>
                  <p>{message.content}</p>
                  <p className="text-sm text-gray-400">
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
      {/** input message container */}
      <div className="fixed bottom-4 w-full h-16">
        <div className="pr-10 gap-4 flex items-center justify-center h-full rounded-full w-1/2 mx-auto dark:bg-gray-900">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key == "Enter") {
                sendMessage();
              }
            }}
            type="text"
            placeholder="Type your message here..."
            className="dark:border-gray-700 dark:bg-gray-800 w-full  px-5 py-2 rounded-full h-full focus:ring-0 focus:outline-none"
          />
          <div className="flex gap-4">
            <button className="dark:bg-blue-600 flex justify-center items-center h-10 w-10 rounded-full">
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              className="dark:bg-blue-600 flex justify-center items-center h-10 w-10 rounded-full"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

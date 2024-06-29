import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Stack } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull, getPic } from "../config/ChatLogics";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@chakra-ui/avatar";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat.js";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useBreakpointValue } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import ChatLoading from "./ChatLoading";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal.js";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "https://chatapp-backend-or0g.onrender.com"; // -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain, fetchProps }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newMessageForPic, setNewMessageForPic] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showExitGroupModal, setShowExitGroupModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const toast = useToast();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [showDemoPic, setShowDemoPic] = useState(false);

  const imageRef = useRef(null);

  const selectImage = () => imageRef.current?.click();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  // Determine the number of users to display based on screen size
  const numberOfUsersToShow = useBreakpointValue({
    base: 1, // For smaller screens
    sm: 2,   // For small screens
    md: 3,   // For medium screens
    lg: 4,   // For large screens
    xl: 5,   // For extra large screens
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const postDetails = (picture) => {
    setPicLoading(true);

    if (picture.length <= 0) return;

    if (picture.length > 1){
      toast({
        title: "You can only send 1 image at a time!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    const pics = picture[0];

    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setShowDemoPic(true);

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "mern-chat-app");
      data.append("cloud_name", "dfzbbx31u");
      fetch("https://api.cloudinary.com/v1_1/dfzbbx31u/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data);
          setPicLoading(false);
        })
        .catch((err) => {
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an .png or .jpg Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  const imageSend = async (e) => {
    e.preventDefault();
      socket.emit("stop typing", selectedChat._id);
    try {

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessageForPic("");
      const response = await axios.post(
        "https://chatapp-backend-or0g.onrender.com/api/message/attachment",
        {
          public_id: pic.public_id,
          url: pic?.url?.toString(),
          content: newMessageForPic,
          chatId: selectedChat,
        },
        config
      );
      setShowDemoPic(false)
      const data = response.data
      
      if (data){
        pop_sound();
        socket.emit("new message", data);
        setMessages([...messages, data]);
        fetchProps();
      toast({
        title: "Successfully",
        description: "Image sent successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
      else {
        toast({
          title: "Error Occured!",
          description: "Failed to Send the Images",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }

      // Fetching Here
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Send the Image",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `https://chatapp-backend-or0g.onrender.com/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "https://chatapp-backend-or0g.onrender.com/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        pop_sound();
        socket.emit("new message", data);
        setMessages([...messages, data]);
        fetchProps();
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  function pop_sound() { 
    const audio = new Audio('/pop_sound.wav'); 
    audio.play(); 
} 

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          localStorage.setItem(
            "notificationChat",
            JSON.stringify(notification)
          );
          notification_sound();
          // notification_toast();
          notification_toast(newMessageRecieved);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        receive_sound();
      }
    });
  });

  const notification_toast = (newMessageNotification) => {
    if (userInteracted) {
      toast({
        position: 'bottom-right',
        title: (
          <div className="flex flex-col gap-1">
              <p className="text-[1.1rem] font-semibold line-clamp-1">New Message {newMessageNotification?.chat?.isGroupChat ? (<span className="text-sm font-normal">• {newMessageNotification?.chat?.chatName}</span>) : ""}</p>
          <div color='white' p={3} className=" flex items-center gap-2 overflow-hidden">
            <Avatar src={newMessageNotification?.sender?.pic} />
            <div className="flex flex-col justify-around overflow-hidden">
            <h1 className="text-lg line-clamp-1">{newMessageNotification?.sender?.name}</h1>
            <h1 className="text-sm text-[#ebebeb] font-normal line-clamp-1">{newMessageNotification?.content}</h1>
            </div>
          </div>
          </div>
        ),
        containerStyle: {
          width: '400px',
          maxWidth: '100%',
        },
        status: 'success',
        isClosable: true,
      });
    }
  };

function notification_sound() {
  if (userInteracted) {
    const audio = new Audio('/notification.wav');
    audio.volume = 0.1;
    audio.play().catch(error => console.log("notification_sound error",error));
  }
}

  function receive_sound() { 
    const audio = new Audio('/receive_sound.mp3');
    audio.volume = 0.1;
    audio.play(); 
} 

  const typingHandler = (e) => {
    e.preventDefault();
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const typingHandlerPicture = (e) => {
    e.preventDefault();
    setNewMessageForPic(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        'https://chatapp-backend-or0g.onrender.com/api/chat/groupremove',
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    setShowMembersModal(false);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('https://chatapp-backend-or0g.onrender.com/api/chat', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setFetchAgain(fetchAgain);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = async (chatId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const data = await axios.delete(
        'https://chatapp-backend-or0g.onrender.com/api/chat/contactremove',
        { chatId },
        config
      );

      //   if (!chats.find((c) => c._id === data._id))
      //   setChats([data, ...chats]);
      //   setSelectedChat(data);
    } catch (error) {
      toast({
        title: "Error deleting the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <Menu>
                    <MenuButton
                      bg="white"
                      _hover={{ bg: "gray.100" }}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      <div>
                        <Avatar
                          size="md"
                          mr={3}
                          cursor="pointer"
                          src={getPic(user, selectedChat.users)}
                        />
                        {getSender(user, selectedChat.users)}
                      </div>
                    </MenuButton>
                    <MenuList>
                      <div className="flex flex-col gap-3 py-3 px-3">
                        <Avatar
                          size="lg"
                          mr={3}
                          cursor="pointer"
                          src={getPic(user, selectedChat.users)}
                        />
                        <h1 className="text-2xl font-extrabold font-mono">
                          {getSender(user, selectedChat.users)}
                        </h1>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Created
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            {selectedChat.createdAt.slice(0, 9)}{" "}
                            {selectedChat.createdAt.slice(11, 16)}
                          </h1>
                        </div>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Description
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            {selectedChat.description
                              ? selectedChat.description
                              : "----"}
                          </h1>
                        </div>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Disappearing messages
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            Off
                          </h1>
                          <MenuDivider />
                        </div>
                        <div className="flex gap-3">
                          <div>
                            <Button
                              onClick={() => setShowDeleteModal(true)}
                              colorScheme="red"
                            >
                              Delete
                            </Button>

                            <Modal
                              isOpen={showDeleteModal}
                              onClose={() => setShowDeleteModal(false)}
                            >
                              <ModalOverlay />
                              <ModalContent>
                                <ModalHeader>Delete User</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                  Are you sure you want to delete the user? This
                                  action cannot be undone.
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    colorScheme="green"
                                    mr={3}
                                    onClick={() => setShowDeleteModal(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleDelete(selectedChat?._id)
                                    }
                                    colorScheme="red"
                                  >
                                    Delete
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </div>
                          <div>
                            <Button
                              onClick={() => setShowReportModal(true)}
                              colorScheme="red"
                              variant="outline"
                            >
                              Report contact
                            </Button>

                            <Modal
                              isOpen={showReportModal}
                              onClose={() => setShowReportModal(false)}
                            >
                              <ModalOverlay />
                              <ModalContent>
                                <ModalHeader>Report contact</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                  Report spam and block{" "}
                                  {getSender(user, selectedChat.users)}? If you
                                  report and block, this chat's history will
                                  also be deleted.
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    colorScheme="green"
                                    mr={3}
                                    onClick={() => setShowReportModal(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleRemove(user)}
                                    colorScheme="red"
                                  >
                                    Report and block
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </div>
                        </div>
                      </div>
                    </MenuList>
                  </Menu>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  <Menu>
                    <MenuButton
                      bg="white"
                      _hover={{ bg: "gray.100" }}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      <div className="flex items-center">
                        <Avatar
                          size="md"
                          mr={3}
                          cursor="pointer"
                          src={selectedChat.pic}
                        />
                        <div className="flex flex-col items-start justify-center">
                          <h1>{selectedChat.chatName}</h1>
                          <div className="flex gap-1">
                            {selectedChat?.users
                              ?.slice(0, numberOfUsersToShow)
                              .map((user, index) => (
                                <h6 key={index} className="text-[15px]">
                                  {user.name},
                                </h6>
                              ))}
                            {selectedChat?.users?.length > numberOfUsersToShow && (
                              <h6 className="text-[15px]">...</h6>
                            )}
                          </div>
                        </div>
                      </div>
                    </MenuButton>
                    <MenuList>
                      <div className="flex flex-col gap-3 py-3 px-3">
                        <Avatar
                          size="lg"
                          mr={3}
                          cursor="pointer"
                          src={selectedChat.pic}
                        />
                        <h1 className="text-2xl font-extrabold font-mono">
                          {selectedChat.chatName}
                        </h1>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Created
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            {selectedChat.createdAt.slice(0, 9)}{" "}
                            {selectedChat.createdAt.slice(11, 16)}
                          </h1>
                        </div>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Description
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            {selectedChat.description
                              ? selectedChat.description
                              : "----"}
                          </h1>
                        </div>
                        <div>
                          <h1 className="text-base text-[#5a5959] font-semibold">
                            Disappearing messages
                          </h1>
                          <h1 className="text-base text-[#000000] font-semibold font-sans">
                            Off
                          </h1>
                          <MenuDivider />
                        </div>
                        <div className="flex gap-3">
                          <div>
                            <Button
                              onClick={() => setShowExitGroupModal(true)}
                              colorScheme="red"
                            >
                              Exit Group
                            </Button>

                            <Modal
                              isOpen={showExitGroupModal}
                              onClose={() => setShowExitGroupModal(false)}
                            >
                              <ModalOverlay />
                              <ModalContent>
                                <ModalHeader>Leave Group</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                  Are you sure you want to exit the group? This
                                  action cannot be undone.
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    colorScheme="green"
                                    mr={3}
                                    onClick={() => setShowExitGroupModal(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleRemove(user)}
                                    colorScheme="red"
                                  >
                                    Exit Group
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </div>
                          <div>
                            <Button
                              onClick={() => setShowMembersModal(true)}
                              colorScheme="green"
                            >
                              Members
                            </Button>

                            <Modal
                              isOpen={showMembersModal}
                              onClose={() => setShowMembersModal(false)}
                              size="sm"
                              scrollBehavior="inside"
                            >
                              <ModalOverlay />
                              <ModalContent>
                                <ModalHeader>
                                  Members ({selectedChat.users.length})
                                </ModalHeader>
                                <ModalCloseButton />
                                <Box
                                  display="flex"
                                  flexDir="column"
                                  p={3}
                                  bg="#F8F8F8"
                                  w="100%"
                                  h="100%"
                                  borderRadius="lg"
                                  overflowY="hidden"
                                >
                                  {selectedChat ? (
                                    <Stack overflowY="scroll">
                                      {selectedChat.users.map((chat) => (
                                        <Box
                                          onClick={() => accessChat(chat._id)}
                                          cursor="pointer"
                                          bg="#E8E8E8"
                                          _hover={{
                                            bg: "#38B2AC",
                                            color: "white",
                                          }}
                                          px={3}
                                          py={2}
                                          borderRadius="lg"
                                          key={chat._id}
                                          display="flex"
                                          alignItems="center"
                                        >
                                          <Avatar
                                            size="md"
                                            mr={3}
                                            cursor="pointer"
                                            src={chat.pic}
                                          />
                                          <div>
                                            <div className="flex justify-between">
                                              <Text
                                                fontSize={{
                                                  base: "17px",
                                                  md: "10px",
                                                  lg: "17px",
                                                }}
                                              >
                                                {chat.name}
                                                <b className="text-[#2a865b]">
                                                  {user._id === chat._id
                                                    ? "(You)"
                                                    : ""}
                                                </b>
                                              </Text>
                                              <b className="text-[#3fb83f] font-medium text-sm">
                                                {selectedChat.groupAdmin._id ===
                                                chat._id
                                                  ? "Admin"
                                                  : ""}
                                              </b>
                                            </div>
                                            <Text
                                              fontSize={{
                                                base: "17px",
                                                md: "10px",
                                                lg: "17px",
                                              }}
                                            >
                                              Email: {chat.email}
                                            </Text>
                                          </div>
                                        </Box>
                                      ))}
                                    </Stack>
                                  ) : (
                                    <ChatLoading />
                                  )}
                                </Box>
                              </ModalContent>
                            </Modal>
                          </div>
                        </div>
                      </div>
                    </MenuList>
                  </Menu>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

<div className="flex align-middle gap-2">
            <div onClick={selectImage} className="cursor-pointer px-2 h-9 mt-3 pt-1 hover:bg-[#8cc0a3] rounded-md duration-500">
            <AttachmentIcon boxSize={5} />
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
              onChange={(e) => postDetails(e.target.files)}
              ref={imageRef}
            />
          </div>
          <Modal
            isOpen={showDemoPic}
            onClose={() => setShowDemoPic(false)}
          >
              <ModalOverlay />
            <ModalContent>
                <ModalHeader>Send image to {getSender(user, selectedChat.users)}</ModalHeader>
              <ModalCloseButton />
            <ModalBody>
            {picLoading ? (
              <div className="pl-28">
                <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
              </div>
              ) : (
                <>
              <img src={pic?.url?.toString()} alt="pic" />
              <FormControl
              id="first-name"
              isRequired
              mt={3}
            >
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessageForPic}
                onChange={typingHandlerPicture}
              />
            </FormControl>
              </>
              )}
            </ModalBody>
                                <ModalFooter>
                                  <Button
                                    colorScheme="green"
                                    mr={3}
                                    onClick={() => setShowDemoPic(false)}
                                  >
                                    Cancel
                                  </Button>
                                  {picLoading ? (
                                    <Button
                                      colorScheme={picLoading? ("teal"):("green")}
                                      isLoading
                                      loadingText='Loading'
                                      variant='outline'
                                      spinnerPlacement='start'
                                    ></Button>
                                  ) : (
                                    <Button
                                      onClick={(e) => imageSend(e)}
                                      colorScheme="green"
                                    >Send</Button>
                                  )}
                                </ModalFooter>
                              </ModalContent>
                            </Modal>

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
            </div>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <div className="lg:w-[100%] max-lg:w-full h-[100%] flex flex-col justify-between items-center py-5 px-6">
            <div className="flex flex-col items-center py-36">
              <img src="/chatLogo.png" alt="" className="w-24" />
              <h1 className="text-[25px] font-semibold text-[#336d22] py-3">
                FastChat for Web
              </h1>
              <h1 className="text-[16px] font-medium text-center text-[#474747c2]">
                Send and receive messages without keeping your phone online.
              </h1>
              <h1 className="text-[16px] font-medium text-center text-[#474747c2]">
                Use FastChat on up to 4 linked devices and 1 phone at the same
                time.
              </h1>
            </div>
            <h1 className="text-[#8b8a8a] font-medium">
              🔒 End-to-end encrypted
            </h1>
          </div>
        </Box>
      )}
    </>
  );
};

export default SingleChat;

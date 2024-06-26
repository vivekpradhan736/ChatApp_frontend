import React, { useCallback, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import ChatLoading from "../ChatLoading.js";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal.js";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import UserListItem from "../userAvatar/UserListItem.js";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics.js";
import debounce from "lodash.debounce";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [notificationData, setNotificationData] = useState([]);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();
  
  useEffect(() => {
    const uniqueNotifications = [];
    const chatIds = new Set();

    notification.forEach((notif) => {
      if (!chatIds.has(notif.chat._id)) {
        uniqueNotifications.push(notif);
        chatIds.add(notif.chat._id);
      }
    });

    setNotificationData(uniqueNotifications);
  }, [notification]);
  

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async (value = '') => {
    // if (!search) {
    //   toast({
    //     title: "Please Enter something in search",
    //     status: "warning",
    //     duration: 5000,
    //     isClosable: true,
    //     position: "top-left",
    //   });
    //   return;
    // }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`https://chatapp-backend-or0g.onrender.com/api/user?search=${value}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('https://chatapp-backend-or0g.onrender.com/api/chat', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) 
      setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
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

  const debounceAPI = useCallback(debounce((value)=> handleSearch(value), 1000), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 2000); 
    
    return () => clearTimeout(timer);
  }, [])

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          FastChat
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
              count={notificationData?.length}
              effect={Effect.SCALE}
            />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList minWidth='260px'>
            {!notificationData.length && "No New Messages"}
            {notificationData.length > 0 && (
              <div className="flex items-center justify-between text-lg w-full h-8 px-2 py-2 bg-[#38B2AC] text-white">
                <div className="flex items-center gap-1">
              <BellIcon/>
              <h1>{notificationData.length} Notification</h1>
              </div>
              <button
                onClick={() => {
                  setNotification([]);
                  localStorage.setItem('notificationChat', JSON.stringify([]));
                }}
                className="hover:text-[#e9e9e9]"
              >
                Clear
              </button>
              </div>
            )}
            {notificationData?.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectedChat(notif.chat);
                  const remainingNotification = notification.filter((n) => n !== notif);
                  setNotification(remainingNotification);
                  localStorage.setItem('notificationChat', JSON.stringify(remainingNotification));
                }}
              >
                {notif.chat.isGroupChat
                  ? (<div className="flex justify-between w-[16rem]">
                    <div className="flex gap-2 w-[80%] overflow-hidden">
                  <img src={notif.chat.pic} alt="" className="w-10 h-10 rounded-full" />
                  <div className="overflow-hidden">
                  <h1 className="font-semibold line-clamp-1">{notif.chat.chatName}</h1>
                  <h2 className="text-xs line-clamp-1">{notif.content}</h2>
                  </div>
                  </div>
                  <div className="w-[20%]">
                  <h1 className="text-xs pt-1">{notif?.chat?.latestMessage
                      ? (() => {
                          const messageDate = new Date(
                            notif?.createdAt
                          );
                          const currentDate = new Date();
                          const yesterday = new Date(currentDate);
                          yesterday.setDate(currentDate.getDate() - 1);
                          const hour = messageDate.getHours();

                          if (
                            messageDate.toDateString() ===
                            currentDate.toDateString()
                          ) {
                            // If message date is today, display the time
                            if(hour >= 12){
                              return `${messageDate.getHours()}:${messageDate.getMinutes()} PM`;
                            }
                            return `${hour}:${messageDate.getMinutes()} AM`;
                            // return `${messageDate.getHours()}:${messageDate.getMinutes()}`;
                          } else if (
                            messageDate.toDateString() ===
                            yesterday.toDateString()
                          ) {
                            // If message date is yesterday, display "Yesterday"
                            return "Yesterday";
                          } else {
                            // Otherwise, display the full date
                            return messageDate.toLocaleDateString();
                          }
                        })()
                      : ""} </h1>
                      </div>
                  </div>)
                  : (
                    <div>{!notif.chat.isGroupChat
                    ? (() => {
                      return (
                        <div className="flex justify-between w-[16rem]">
                    <div className="flex gap-2 w-[80%] overflow-hidden">
                  <img src={notif?.sender?.pic} alt="" className="w-10 h-10 rounded-full" />
                  <div className="overflow-hidden">
                  <h1 className="font-semibold line-clamp-1">{notif?.sender?.name}</h1>
                  <h2 className="text-xs line-clamp-1">{notif?.content}</h2>
                  </div>
                  </div>
                  <div className="w-[20%]">
                  <h1 className="text-xs pt-1">{notif?.chat?.latestMessage
                      ? (() => {
                          const messageDate = new Date(
                            notif?.createdAt
                          );
                          const currentDate = new Date();
                          const yesterday = new Date(currentDate);
                          yesterday.setDate(currentDate.getDate() - 1);
                          const hour = messageDate.getHours();

                          if (
                            messageDate.toDateString() ===
                            currentDate.toDateString()
                          ) {
                            // If message date is today, display the time
                            if(hour >= 12){
                              return `${messageDate.getHours()}:${messageDate.getMinutes()} PM`;
                            }
                            return `${hour}:${messageDate.getMinutes()} AM`;
                            // return `${messageDate.getHours()}:${messageDate.getMinutes()}`;
                          } else if (
                            messageDate.toDateString() ===
                            yesterday.toDateString()
                          ) {
                            // If message date is yesterday, display "Yesterday"
                            return "Yesterday";
                          } else {
                            // Otherwise, display the full date
                            return messageDate.toLocaleDateString();
                          }
                        })()
                      : ""} </h1>
                      </div>
                  </div>
                      )
                    })()
                   : "" }</div>
                  )
                  // `New Message from ${getSender(user, notif.chat.users)}`
                  }
              </MenuItem>
            ))}
          </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  debounceAPI(e.target.value)
                }}
              />
              <Button onClick={handleSearch}>All</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.length > 0 ? (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))) : (
                <Text className="text-red-600 py-6 px-14">No User Found🙅🏻</Text>
                )
            )}
            {loadingChat && <Spinner m="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;

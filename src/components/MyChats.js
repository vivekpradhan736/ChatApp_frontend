import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { Button } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import axios from "axios";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { getSender, getPic } from "../config/ChatLogics.js";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal.js";
import { ChatState } from "../Context/ChatProvider";

const MyChats = forwardRef((props, ref, fetchAgain) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();


  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("https://chatapp-backend-or0g.onrender.com/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useImperativeHandle(ref, () => ({
    fetchChats
  }));
  const selectUser = JSON.parse(localStorage.getItem("selectedChat"));
  
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    localStorage.removeItem("selectedChat");
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("notifications"));
    if (storedNotifications) {
      setNotification(storedNotifications);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notification));
  }, [notification]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "24px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
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
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => {
                  setSelectedChat(chat)
                  const remainingNotification = notification.filter((n) => n.chat._id !== chat._id);
                  setNotification(remainingNotification);
                  localStorage.setItem('notificationChat', JSON.stringify(remainingNotification));
                  localStorage.setItem('selectedChat', JSON.stringify(chat));
                }}
                cursor="pointer"
                bg={selectUser?._id === chat?._id ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" overflow="hidden">
                  {!chat.isGroupChat ? (
                    <Avatar
                      size="md"
                      mr={3}
                      cursor="pointer"
                      name={chat.users[1].name}
                      src={getPic(loggedUser, chat.users)}
                    />
                  ) : (
                    <Avatar size="md" mr={3} cursor="pointer" src={chat?.pic} />
                  )}
                  <div className="">
                    <p className={`line-clamp-1 text-lg font-medium ${selectUser?._id === chat?._id ? 'text-white' : 'text-[#000000]'}`}>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </p>
                    {chat.latestMessage && (
                      <p className="line-clamp-1">
                        {!chat.isGroupChat ? (
                          <></>
                        ) : (
                          <>
                            {chat.latestMessage.sender._id === user._id ? (
                              <b className="text-base text-[#575656]">You : </b>
                            ) : (
                              <b className="text-base text-[#575656]">
                                {chat.latestMessage.sender.name} :{" "}
                              </b>
                            )}
                          </>
                        )}
                        <span
                          className={`font-mono text-[0.93rem] 
                      ${selectUser?._id === chat?._id ? 'text-[#e8e6e6]' : 'text-[#636463]'}
                        `}
                        >
                          {chat.latestMessage.attachments.length > 0 ? (
                            <span>🖼️Photo</span>
                          ) : (
                            <span>{chat.latestMessage.content}</span>
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </Box>
                <Box
                  display="flex"
                  flexDirection={"column"}
                  alignItems={"end"}
                  gap={3}
                >
                  <h1 className="text-[#3b3b3b] text-sm translate-x-3 w-[4.2rem]">
                    {chat?.latestMessage
                      ? (() => {
                          const messageDate = new Date(
                            chat?.latestMessage?.createdAt
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
                      : ""}
                  </h1>
                  {notification.filter((n) => n.chat._id === chat._id).length > 0 ? (
                  <div className=" flex items-center justify-center w-4 h-4 rounded-full bg-green-600 text-white text-xs">
                    {notification.filter((n) => n.chat._id === chat._id).length}
                  </div>
                  ) : (<div className="mb-3"></div>)}
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
});

export default MyChats;

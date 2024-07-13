import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { HamburgerIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const ENDPOINT = process.env.REACT_SERVER; // -> After deployment

const ScrollableChat = ({ messages, fetchMessages }) => {
  const { user } = ChatState();
  console.log("messages", messages);
  const [showDemoPic, setShowDemoPic] = useState(false);
  const [imageData, setImageData] = useState("");

  const toast = useToast();
  console.log("message", messages)

  const chatDelete = async (chat) => {
    if (chat === undefined) {
      toast({
        title: "Chat not found!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      console.log("Sending delete request to server...");
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const chatData = {
        chatId: chat._id,
        attachments: chat.attachments[0], // Assuming there's only one attachment per message
      };

      const response = await axios.post(
        `https://chatapp-backend-or0g.onrender.com/api/message/attachmentcancel`,
        chatData,
        config
      );
      console.log("response", response);

      if (response?.data?.success === true) {
        fetchMessages();
        toast({
          title: "Chat deletion successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } else {
        toast({
          title: "Failed to delete chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error deleting chats:", error.message);
      toast({
        title: "Error deleting chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <ScrollableFeed>
      {messages.map((m, i) => {
        // Check if it's the first message or the date is different from the previous one
        const isFirstMessage = i === 0 || new Date(messages[i - 1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();

        return (
          <div key={m._id}>
            {isFirstMessage && (
              <div className="flex justify-center">
              <p className="text-center text-white w-[9rem] px-2 rounded-md mb-3 bg-[#525352]">
                {new Date(m.createdAt).toDateString()}
              </p>
              </div>
            )}
            <div style={{ display: "flex" }}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <div
                style={{
                  backgroundColor: `${m.isDeletedChat ? "#BDBDBD" :
                    m.sender._id === user._id ? "#BEE3F8" : "#65ec99"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "5px",
                  padding: "5px 5px 2px 10px",
                  maxWidth: "75%",
                }}
              >
                <div className="flex items-start justify-end gap-1">
                <div className="flex flex-col justify-start w-full">
                {m.attachments.length > 0 ? (
                  <>
                    <div onClick={() => {
                      setImageData(m?.attachments[0]?.url)
                      setShowDemoPic(true)}}
                      className="max-w-[200px] overflow-hidden pt-2">
                      <img
                        src={m?.attachments[0]?.url}
                        alt="attachment"
                        className="w-[100%] object-contain"
                      />
                    </div>

            <Modal
            isOpen={showDemoPic}
            onClose={() => setShowDemoPic(false)}
            size="xl"
          >
            <ModalContent>
                <ModalHeader>My Photo </ModalHeader>
              <ModalCloseButton />
            <ModalBody maxWidth='550px' overflow='hidden'>
            <img
                        src={imageData}
                        alt="attachment"
                        className="w-[100%] object-contain pb-6"
                      />
            </ModalBody>
          </ModalContent>
        </Modal>
                  </>
                ) : (
                  ""
                )}
                <p className={`${m.isDeletedChat ? "italic" : ""}`}>{m.content}</p>
                </div>
                <Menu>
                  <MenuButton>
                  <BsThreeDotsVertical className="pt-1 pb-1 h-5"/>
                  </MenuButton>
                  <MenuList minWidth='140px'>
                    <MenuItem
                    minH='28px'
                      icon={<DeleteIcon />}
                      onClick={() => chatDelete(m)}
                    >
                      Delete chat
                    </MenuItem>
                  </MenuList>
                </Menu>
                </div>
                <p className="text-xs float-right pt-1 pl-4">{(() => {
                  const messageDate = new Date(m?.createdAt);
                  const hour = messageDate.getHours();
                  if (m?.createdAt) {
                    if(hour >= 12){
                      return `${messageDate.getHours()}:${messageDate.getMinutes()} PM`;
                    }
                    return `${hour}:${messageDate.getMinutes()} AM`;
                  }
                })()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;

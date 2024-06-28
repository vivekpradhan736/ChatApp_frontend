import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
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
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  console.log("messages", messages);
  const [showDemoPic, setShowDemoPic] = useState(false);
  const [imageData, setImageData] = useState("");

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
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#65ec99"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "5px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {m.attachments.length > 0 ? (
                  <>
                    <div onClick={() => {
                      setImageData(m?.attachments[0]?.url)
                      setShowDemoPic(true)}}>
                      <img
                        src={m?.attachments[0]?.url}
                        alt="attachment"
                        className="w-40 h-40"
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
            <ModalBody>
            <img
                        src={imageData}
                        alt="attachment"
                        className="w-full h-[26rem]"
                      />
            </ModalBody>
          </ModalContent>
        </Modal>
                  </>
                ) : (
                  ""
                )}
                {m.content}
                <p className="text-xs float-right pt-3 pl-4">{(() => {
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

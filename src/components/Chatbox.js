import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat.js";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain, triggerChild2Function, sidebarWidth }) => {
  const { selectedChat } = ChatState();
  const triggerChild1Function = () => {
    // Call handleTrigger function of ChildComponent2
    triggerChild2Function();
  };

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: `${sidebarWidth}rem` }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchProps={triggerChild1Function} />
    </Box>
  );
};

export default Chatbox;
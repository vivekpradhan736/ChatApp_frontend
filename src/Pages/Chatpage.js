import { Box } from "@chakra-ui/layout";
import { useRef , useState } from "react";
import Chatbox from "../components/Chatbox.js";
import MyChats from "../components/MyChats.js";
import SideDrawer from "../components/miscellaneous/SideDrawer.js";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const child2Ref = useRef(null);
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  const triggerChild2Function = () => {
    // Call handleTrigger function of ChildComponent2 through ref
    child2Ref.current.fetchChats();
  };

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain={fetchAgain} ref={child2Ref} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} triggerChild2Function={triggerChild2Function} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
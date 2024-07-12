import { Box } from "@chakra-ui/layout";
import { useEffect, useRef , useState } from "react";
import Chatbox from "../components/Chatbox.js";
import MyChats from "../components/MyChats.js";
import SideDrawer from "../components/miscellaneous/SideDrawer.js";
import { ChatState } from "../Context/ChatProvider";
import { GoMirror } from "react-icons/go";
import "../index.css";

const Chatpage = () => {
  const child2Ref = useRef(null);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(310); // Initial width
  const [isResizing, setIsResizing] = useState(false);
  const { user, selectedChat } = ChatState();

  const triggerChild2Function = () => {
    // Call handleTrigger function of ChildComponent2 through ref
    child2Ref.current.fetchChats();
  };

  const handleMouseMove = (e) => {
    if(selectedChat){
      if (e.clientX > 200 && e.clientX < window.innerWidth - 500) {
        setSidebarWidth(e.clientX);
      }
    }
    else{
      if (e.clientX > 200 && e.clientX < window.innerWidth - 200) {
        setSidebarWidth(e.clientX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div style={{ width: "100%" }} className={`${isResizing ? "select-none" : ""}`}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain={fetchAgain} ref={child2Ref} sidebarWidth={sidebarWidth} />}
        {user && <div id="resizer" onMouseDown={handleMouseDown} className="relative z-2 cursor-col-resize border-[1px] hover:border-[1px] border-r border-opacity-5 text-[#7a7474] border-[#4990ca] hover:bg-[#d4eafc] m-0 p-0 box-border md:flex flex-col justify-center hidden">||
        </div>}
        {user && (
          <Chatbox sidebarWidth={window.innerWidth - sidebarWidth} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} triggerChild2Function={triggerChild2Function} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
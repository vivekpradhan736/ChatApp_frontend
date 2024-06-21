import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login.js";
import Signup from "../components/Authentication/Signup.js";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="flex w-full h-scree">
      <div className="max-lg:w-[50%] lg:w-[30%] max-sm:w-[100%] bg-white px-4">
        <Image src="/appLogo.png" p="20px 0 20px 0" alt="logo" />
        <Text
          p="5px"
          fontSize="33px"
          fontFamily="Work sans"
          as="b"
          fontWeight="20px"
          color={"#00684A"}
        >
          Log in to your account
        </Text>

        <Box
          bg="white"
          w="100%"
          p={4}
          mt={5}
          borderRadius="lg"
          borderWidth="1px"
        >
          <Tabs isFitted variant="soft-rounded" colorScheme='green'>
            <TabList mb="1em">
              <Tab>Login</Tab>
              <Tab>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </div>
      <div className="max-lg:w-[50%] w-[70%] max-sm:hidden flex  bg-[#BDF6D9] max-lg:bg-[#34d068]">
        <div className="lg:w-[42%] max-lg:w-full h-[100vh] flex flex-col justify-between items-center py-5 px-6">
          <div className="flex flex-col items-center py-36">
            <img src="/chatLogo.png" alt="" className="w-24" />
            <h1 className="text-[28px] font-semibold text-[#336d22] py-3">FastChat for Web</h1>
            <h1 className="text-[18px] font-semibold text-center text-[#000000c2]">Send and receive messages without keeping your phone online. Use FastChat on up to 4 linked devices and 1 phone at the same time.</h1>
          </div>
          <h1 className="text-[#6d6767] font-medium">
            © {new Date().getFullYear()} FastChat
          </h1>
        </div>
        <div className="w-[70%] max-lg:hidden">
          <img src="/loginPic.png" alt="logo" className="h-[708px] object-cover" />
        </div>
      </div>
    </div>
  );
}

export default Homepage;

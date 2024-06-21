import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { ChatState } from "../../Context/ChatProvider";

const UserBadgeItem = ({ allUsers, handleFunction, admin }) => {
    const { user } = ChatState();
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="purple"
      cursor="pointer"
      onClick={handleFunction}
    >
      <Avatar
        boxSize="20px"
        mr={1}
        cursor="pointer"
        name={allUsers?.name}
        src={allUsers?.pic}
      />
      {allUsers.name}
      {admin?._id === allUsers._id && (
        <span className="text-green-400"> (Admin)</span>
      )}
      {user?._id === allUsers._id && <span className="text-green-400"> (You)</span>}
      <CloseIcon
        pl={1}
        pr={1}
        boxSize="17px"
        className="hover:bg-[#9e5ee7] rounded-sm"
      />
    </Badge>
  );
};

export default UserBadgeItem;
